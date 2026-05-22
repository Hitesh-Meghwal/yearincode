import 'package:flutter/material.dart';
import '../models/wrapped_stats.dart';
import '../themes/archetype_themes.dart';
import '../widgets/confetti_burst.dart';
import 'slide_scaffold.dart';

/// Magazine cover. The year is the cover photo: 240px+, bleeds off the right
/// edge. Everything else is editorial scaffolding around it — kicker top-left,
/// rotated @username sticker, deadpan tagline at the bottom-left.
class IntroSlide extends StatelessWidget {
  final WrappedStats stats;
  final ArchetypeTheme theme;
  const IntroSlide({super.key, required this.stats, required this.theme});

  @override
  Widget build(BuildContext context) {
    return SlideScaffold(
      theme: theme,
      backgroundSeed: 11,
      padding: EdgeInsets.zero,
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          // Confetti above background, below content.
          Positioned.fill(
            child: ConfettiBurst(
              colors: [theme.primary, theme.secondary, Colors.white],
              delay: const Duration(milliseconds: 500),
              particleCount: 70,
              duration: const Duration(milliseconds: 3000),
            ),
          ),

          // KICKER — top-left, mono, all caps. Magazine masthead vibe.
          Positioned(
            top: 60,
            left: 32,
            right: 32,
            child: FadeIn(
              delay: const Duration(milliseconds: 150),
              slideFrom: const Offset(-0.15, 0),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Container(
                    width: 9,
                    height: 9,
                    decoration: BoxDecoration(
                      color: theme.primary,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      '> YEARINCODE / ${stats.year} RECAP',
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.85),
                        fontSize: 11,
                        fontFamily: 'monospace',
                        fontWeight: FontWeight.w700,
                        letterSpacing: 2.4,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Thin rule under the kicker.
          Positioned(
            top: 86,
            left: 32,
            right: 32,
            child: FadeIn(
              delay: const Duration(milliseconds: 250),
              child: Container(
                height: 1,
                color: Colors.white.withValues(alpha: 0.18),
              ),
            ),
          ),

          // USERNAME sticker — pinned top-right at an angle, collage style.
          Positioned(
            top: 120,
            right: 28,
            child: FadeIn(
              delay: const Duration(milliseconds: 600),
              slideFrom: const Offset(0.2, -0.05),
              child: Transform.rotate(
                angle: 0.05,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 11, vertical: 8),
                  decoration: BoxDecoration(
                    color: theme.secondary,
                    border: Border.all(color: Colors.black, width: 2),
                    boxShadow: const [
                      BoxShadow(
                        color: Colors.black,
                        offset: Offset(3, 3),
                      ),
                    ],
                  ),
                  child: Text(
                    '@${stats.username}',
                    style: const TextStyle(
                      color: Colors.black,
                      fontSize: 15,
                      fontWeight: FontWeight.w900,
                      letterSpacing: -0.3,
                    ),
                  ),
                ),
              ),
            ),
          ),

          // THE YEAR — the cover photo. Massive but capped + FittedBox-shrunk
          // so every digit always reads safely inside the safe area.
          Positioned(
            left: 28,
            right: 28,
            top: 240,
            child: ScaleIn(
              delay: const Duration(milliseconds: 450),
              duration: const Duration(milliseconds: 1100),
              from: 0.55,
              child: ShaderMask(
                shaderCallback: (rect) => LinearGradient(
                  colors: [theme.primary, theme.secondary],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ).createShader(rect),
                blendMode: BlendMode.srcIn,
                child: FittedBox(
                  fit: BoxFit.scaleDown,
                  alignment: Alignment.centerLeft,
                  child: Text(
                    '${stats.year}',
                    textAlign: TextAlign.left,
                    softWrap: false,
                    overflow: TextOverflow.visible,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 110,
                      fontWeight: FontWeight.w900,
                      height: 1.0,
                      letterSpacing: -5,
                    ),
                  ),
                ),
              ),
            ),
          ),

          // Issue-number plate — small, bottom-right, like a magazine SKU.
          Positioned(
            right: 32,
            bottom: 60,
            child: FadeIn(
              delay: const Duration(milliseconds: 1300),
              slideFrom: const Offset(0.1, 0),
              child: Text(
                'ISSUE\nN°${stats.year - 2024}',
                textAlign: TextAlign.right,
                style: TextStyle(
                  color: Colors.white.withValues(alpha: 0.55),
                  fontFamily: 'monospace',
                  fontSize: 10,
                  height: 1.4,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 1.6,
                ),
              ),
            ),
          ),

          // TAGLINE — bottom-left, big and confident. Anchors the composition.
          Positioned(
            left: 32,
            right: 120,
            bottom: 60,
            child: FadeIn(
              delay: const Duration(milliseconds: 1150),
              slideFrom: const Offset(-0.1, 0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 32,
                    height: 3,
                    color: theme.primary,
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'A year,\nshipped.',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 28,
                      fontWeight: FontWeight.w900,
                      height: 1.0,
                      letterSpacing: -1.0,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
