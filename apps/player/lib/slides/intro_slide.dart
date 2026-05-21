import 'package:flutter/material.dart';
import '../models/wrapped_stats.dart';
import '../themes/archetype_themes.dart';
import '../widgets/confetti_burst.dart';
import 'slide_scaffold.dart';

class IntroSlide extends StatelessWidget {
  final WrappedStats stats;
  final ArchetypeTheme theme;
  const IntroSlide({super.key, required this.stats, required this.theme});

  @override
  Widget build(BuildContext context) {
    return SlideScaffold(
      theme: theme,
      backgroundSeed: 11,
      child: Stack(
        children: [
          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                FadeIn(
                  delay: const Duration(milliseconds: 200),
                  child: const SlideTitle('Year in code'),
                ),
                const SizedBox(height: 18),
                FadeIn(
                  delay: const Duration(milliseconds: 400),
                  child: Text(
                    'Hey @${stats.username} 👋',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 30,
                      fontWeight: FontWeight.w700,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
                const SizedBox(height: 32),
                ScaleIn(
                  delay: const Duration(milliseconds: 700),
                  duration: const Duration(milliseconds: 1100),
                  from: 0.3,
                  child: ShaderMask(
                    shaderCallback: (rect) => LinearGradient(
                      colors: [theme.primary, theme.secondary],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ).createShader(rect),
                    child: Text(
                      '${stats.year}',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 160,
                        fontWeight: FontWeight.w900,
                        height: 0.9,
                        letterSpacing: -6,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                FadeIn(
                  delay: const Duration(milliseconds: 1500),
                  child: Text(
                    "Here's how you shipped.",
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.7),
                      fontSize: 20,
                      fontWeight: FontWeight.w500,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
              ],
            ),
          ),
          Positioned.fill(
            child: ConfettiBurst(
              colors: [theme.primary, theme.secondary, Colors.white],
              delay: const Duration(milliseconds: 600),
              particleCount: 70,
              duration: const Duration(milliseconds: 3000),
            ),
          ),
        ],
      ),
    );
  }
}
