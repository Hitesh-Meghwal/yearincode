import 'package:flutter/material.dart';
import '../models/wrapped_stats.dart';
import '../themes/archetype_themes.dart';
import '../widgets/count_up_text.dart';
import 'slide_scaffold.dart';

class CommitsSlide extends StatelessWidget {
  final WrappedStats stats;
  final ArchetypeTheme theme;
  const CommitsSlide({super.key, required this.stats, required this.theme});

  @override
  Widget build(BuildContext context) {
    return SlideScaffold(
      theme: theme,
      backgroundSeed: 31,
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            FadeIn(child: const SlideTitle('You committed')),
            const SizedBox(height: 22),
            ScaleIn(
              delay: const Duration(milliseconds: 300),
              from: 0.6,
              child: ShaderMask(
                shaderCallback: (rect) => LinearGradient(
                  colors: [theme.primary, theme.secondary],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ).createShader(rect),
                child: HeroNumber(
                  child: CountUpText(
                    value: stats.totalCommits,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 140,
                      fontWeight: FontWeight.w900,
                      height: 0.9,
                      letterSpacing: -5,
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 14),
            FadeIn(
              delay: const Duration(milliseconds: 700),
              child: const Text(
                'times this year.',
                style: TextStyle(
                  color: Colors.white70,
                  fontSize: 22,
                  fontWeight: FontWeight.w600,
                ),
                textAlign: TextAlign.center,
              ),
            ),
            const SizedBox(height: 36),
            FadeIn(
              delay: const Duration(milliseconds: 1300),
              child: Wrap(
                spacing: 10,
                runSpacing: 10,
                alignment: WrapAlignment.center,
                children: [
                  StickerBadge(
                    text: '${stats.totalActiveDays} active days',
                    color: theme.secondary,
                    rotation: -0.05,
                  ),
                  StickerBadge(
                    text: '${stats.totalRepos} repos',
                    color: theme.primary,
                    rotation: 0.06,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
