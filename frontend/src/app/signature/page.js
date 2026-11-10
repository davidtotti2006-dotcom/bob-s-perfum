'use client';

/**
 * ═══════════════════════════════════════════════════════════════
 *  /signature — L'ÉPREUVE OLFACTIVE
 * ═══════════════════════════════════════════════════════════════
 *  Seule page du site sur surface encre : c'est la salle d'essai, pas la
 *  boutique. Le thème cream de Bob's reste la règle partout ailleurs.
 *
 *  Le catalogue est chargé pendant que l'utilisateur swipe : au moment du
 *  verdict, le classement est déjà prêt. Aucune attente perçue.
 * ═══════════════════════════════════════════════════════════════
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import OlfactoryStage from '@/components/webgl/OlfactoryStage';
import SwipeDeck from '@/components/match/SwipeDeck';
import MatchResult from '@/components/match/MatchResult';
import { buildDeck } from '@/lib/ingredients';
import { rank } from '@/lib/matchEngine';
import { getPerfumes } from '@/lib/api';

export default function SignaturePage() {
  const [deckSeed, setDeckSeed] = useState(0);
  // `deckSeed` n'est pas lu par buildDeck : il sert de graine de remélange.
  // L'incrémenter est le seul moyen de redemander un deck neuf.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const deck = useMemo(() => buildDeck({ size: 12 }), [deckSeed]);

  const [ambient, setAmbient] = useState('neutral');
  const [profile, setProfile] = useState(null);
  const [catalogue, setCatalogue] = useState([]);

  // Préchargement : lancé au montage, bien avant d'en avoir besoin.
  useEffect(() => {
    getPerfumes({ limit: 100 })
      .then((d) => setCatalogue(d.perfumes || []))
      .catch(() => setCatalogue([]));
  }, []);

  const results = useMemo(
    () => (profile ? rank(profile, catalogue) : []),
    [profile, catalogue]
  );

  const restart = useCallback(() => {
    setProfile(null);
    setAmbient('neutral');
    setDeckSeed((s) => s + 1);
  }, []);

  const showResult = profile !== null;

  return (
    <OlfactoryStage
      familyKey={ambient}
      surface="ink"
      height="auto"
      className="min-h-screen"
    >
      <div className="flex min-h-screen flex-col justify-center py-28">
        {/* Retour discret : on ne piège jamais le visiteur dans un jeu */}
        <Link
          href="/collection"
          className="absolute left-6 top-24 z-20 text-[9px] uppercase tracking-[0.35em]
            text-[#fdfbf7]/40 transition-colors hover:text-[#fdfbf7] md:left-16"
        >
          ← La collection
        </Link>

        {showResult && results.length > 0 ? (
          <MatchResult profile={profile} results={results} onRestart={restart} />
        ) : (
          <SwipeDeck
            key={deckSeed}
            deck={deck}
            onFamilyChange={setAmbient}
            onComplete={setProfile}
          />
        )}

        {/* Aucun résultat. Deux causes très différentes, deux messages. */}
        {showResult && results.length === 0 && (
          <div className="mx-auto max-w-md px-6 text-center">
            {profile.conclusive === false ? (
              <>
                <p className="font-serif text-2xl text-[#ebd5c1]">
                  Rien ne vous a retenu.
                </p>
                <p className="mt-4 text-[11px] leading-relaxed text-[#fdfbf7]/55">
                  Vous avez écarté presque toutes les matières : nous préférons
                  ne rien vous recommander plutôt que de deviner. Reprenez
                  l’épreuve, ou laissez-vous guider par la collection.
                </p>
                <button
                  onClick={restart}
                  className="mt-8 border border-[#ebd5c1] px-8 py-3 text-[10px]
                    uppercase tracking-[0.35em] text-[#fdfbf7] transition-colors
                    hover:bg-[#ebd5c1] hover:text-[#0a0a0a]"
                >
                  Reprendre l’épreuve
                </button>
              </>
            ) : (
              <>
                <p className="font-serif text-2xl text-[#ebd5c1]">Profil établi.</p>
                <p className="mt-4 text-[11px] leading-relaxed text-[#fdfbf7]/55">
                  Le catalogue n’a pas pu être joint. Votre famille dominante est{' '}
                  {profile.dominant} — explorez-la depuis la collection.
                </p>
                <Link
                  href="/collection"
                  className="mt-8 inline-block border border-[#ebd5c1] px-8 py-3 text-[10px]
                    uppercase tracking-[0.35em] text-[#fdfbf7] transition-colors
                    hover:bg-[#ebd5c1] hover:text-[#0a0a0a]"
                >
                  La collection
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </OlfactoryStage>
  );
}
