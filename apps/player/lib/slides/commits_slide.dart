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
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const SlideTitle('You committed'),
            const SizedBox(height: 16),
            HeroNumber(
              child: CountUpText(
                value: stats.totalCommits,
                style: TextStyle(
                  color: theme.primary,
                  fontSize: 96,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'times this year',
              style: TextStyle(color: Colors.white70, fontSize: 22),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 32),
            FadeIn(
              delay: const Duration(milliseconds: 1500),
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  color: theme.secondary.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  '${stats.totalActiveDays} active days',
                  style: TextStyle(
                    color: theme.secondary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
