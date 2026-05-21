import 'package:flutter/material.dart';
import '../models/wrapped_stats.dart';
import '../themes/archetype_themes.dart';
import '../widgets/confetti_burst.dart';
import 'slide_scaffold.dart';

class ArchetypeSlide extends StatelessWidget {
  final WrappedStats stats;
  final ArchetypeTheme theme;
  const ArchetypeSlide({super.key, required this.stats, required this.theme});

  @override
  Widget build(BuildContext context) {
    final a = stats.archetype;
    return SlideScaffold(
      theme: theme,
      backgroundSeed: 23,
      child: Stack(
        children: [
          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                FadeIn(
                  delay: const Duration(milliseconds: 100),
                  child: const SlideTitle('You are…'),
                ),
                const SizedBox(height: 28),
                ScaleIn(
                  delay: const Duration(milliseconds: 250),
                  duration: const Duration(milliseconds: 1200),
                  from: 0.2,
                  child: GentlePulse(
                    minScale: 0.96,
                    maxScale: 1.04,
                    child: Container(
                      width: 200,
                      height: 200,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: RadialGradient(
                          colors: [
                            theme.primary.withValues(alpha: 0.35),
                            Colors.transparent,
                          ],
                        ),
                      ),
                      child: Text(
                        a.emoji,
                        style: const TextStyle(fontSize: 140),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                FadeIn(
                  delay: const Duration(milliseconds: 900),
                  child: ShaderMask(
                    shaderCallback: (rect) => LinearGradient(
                      colors: [theme.primary, theme.secondary],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ).createShader(rect),
                    child: Text(
                      a.name,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 38,
                        fontWeight: FontWeight.w900,
                        height: 1.05,
                        letterSpacing: -1,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                ),
                const SizedBox(height: 14),
                FadeIn(
                  delay: const Duration(milliseconds: 1300),
                  child: StickerBadge(
                    text: _rarityLabel(a.rarity),
                    color: theme.secondary,
                  ),
                ),
                const SizedBox(height: 22),
                FadeIn(
                  delay: const Duration(milliseconds: 1700),
                  child: Container(
                    constraints: const BoxConstraints(maxWidth: 360),
                    child: Text(
                      a.description,
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.78),
                        fontSize: 16,
                        height: 1.45,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                ),
              ],
            ),
          ),
          Positioned.fill(
            child: ConfettiBurst(
              colors: [theme.primary, theme.secondary, Colors.white],
              delay: const Duration(milliseconds: 350),
              particleCount: 80,
              duration: const Duration(milliseconds: 3600),
            ),
          ),
        ],
      ),
    );
  }
}

String _rarityLabel(String rarity) {
  switch (rarity) {
    case 'legendary':
      return 'LEGENDARY ✨';
    case 'rare':
      return 'RARE ✨';
    case 'uncommon':
      return 'UNCOMMON';
    default:
      return 'COMMON';
  }
}
