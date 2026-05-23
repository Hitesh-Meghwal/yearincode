import 'package:flutter/material.dart';
import '../models/wrapped_stats.dart';
import '../themes/archetype_themes.dart';
import '../widgets/confetti_burst.dart';
import '../widgets/twemoji_image.dart';
import '../themes/wrapped_palette.dart';
import 'slide_scaffold.dart';

/// Wrapped Pattern C — headline / reveal. The archetype emoji is the
/// centerpiece, with the archetype name as a big headline below.
/// Rarity word in caps, description as a small caption. Confetti
/// overlays everything for the reveal moment.
class ArchetypeSlide extends StatelessWidget {
  final WrappedStats stats;
  final ArchetypeTheme theme;
  const ArchetypeSlide({super.key, required this.stats, required this.theme});

  @override
  Widget build(BuildContext context) {
    final a = stats.archetype;
    return SlideScaffold(
      theme: theme,
      slideColor: WrappedPalette.archetype,
      padding: EdgeInsets.zero,
      child: Stack(
        children: [
          // Kicker — top-left.
          Positioned(
            top: 56,
            left: 32,
            right: 32,
            child: FadeIn(
              delay: const Duration(milliseconds: 100),
              child: const _WrappedKicker(text: 'YOU ARE'),
            ),
          ),

          // Hero block — emoji + headline + rarity + description.
          Positioned.fill(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(32, 110, 32, 90),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  // The emoji — Twemoji image so the visual matches the
                  // landing-page archetype deck exactly.
                  ScaleIn(
                    delay: const Duration(milliseconds: 200),
                    from: 0.5,
                    duration: const Duration(milliseconds: 900),
                    child: GentlePulse(
                      child: TwemojiImage(emoji: a.emoji, size: 150),
                    ),
                  ),
                  const SizedBox(height: 22),
                  // Headline.
                  FadeIn(
                    delay: const Duration(milliseconds: 450),
                    slideFrom: const Offset(0, 0.06),
                    child: FittedBox(
                      fit: BoxFit.scaleDown,
                      child: Text(
                        a.name,
                        maxLines: 1,
                        softWrap: false,
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 48,
                          fontWeight: FontWeight.w900,
                          height: 1.0,
                          letterSpacing: -1.6,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),
                  // Rarity word.
                  FadeIn(
                    delay: const Duration(milliseconds: 600),
                    child: Text(
                      _rarityLabel(a.rarity),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 2.8,
                        fontFamily: 'monospace',
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),
                  // Description.
                  if (a.description.isNotEmpty)
                    FadeIn(
                      delay: const Duration(milliseconds: 750),
                      child: Text(
                        a.description,
                        maxLines: 3,
                        overflow: TextOverflow.ellipsis,
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.72),
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          height: 1.45,
                          letterSpacing: 0.2,
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ),

          // Confetti — overlays everything.
          Positioned.fill(
            child: IgnorePointer(
              child: ConfettiBurst(
                colors: [theme.primary, theme.secondary, Colors.white],
                delay: const Duration(milliseconds: 400),
                particleCount: 80,
                duration: const Duration(milliseconds: 3600),
              ),
            ),
          ),

          _WrappedWordmark(year: stats.year, username: stats.username),
        ],
      ),
    );
  }
}

String _rarityLabel(String rarity) {
  switch (rarity) {
    case 'legendary':
      return 'LEGENDARY';
    case 'rare':
      return 'RARE';
    case 'uncommon':
      return 'UNCOMMON';
    default:
      return 'COMMON';
  }
}

class _WrappedKicker extends StatelessWidget {
  final String text;
  const _WrappedKicker({required this.text});
  @override
  Widget build(BuildContext context) => Text(
        text,
        style: TextStyle(
          color: Colors.white.withValues(alpha: 0.85),
          fontFamily: 'monospace',
          fontSize: 11,
          fontWeight: FontWeight.w700,
          letterSpacing: 2.2,
        ),
      );
}

class _WrappedWordmark extends StatelessWidget {
  final int year;
  final String username;
  const _WrappedWordmark({required this.year, required this.username});
  @override
  Widget build(BuildContext context) {
    return Positioned(
      right: 28,
      bottom: 28,
      child: Text(
        'yearincode  ·  $year  ·  @$username',
        style: TextStyle(
          color: Colors.white.withValues(alpha: 0.55),
          fontFamily: 'monospace',
          fontSize: 11,
          fontWeight: FontWeight.w600,
          letterSpacing: 1.2,
        ),
      ),
    );
  }
}
