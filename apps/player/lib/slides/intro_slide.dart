import 'package:flutter/material.dart';
import '../models/wrapped_stats.dart';
import '../themes/archetype_themes.dart';
import 'slide_scaffold.dart';

class IntroSlide extends StatelessWidget {
  final WrappedStats stats;
  final ArchetypeTheme theme;
  const IntroSlide({super.key, required this.stats, required this.theme});

  @override
  Widget build(BuildContext context) {
    return SlideScaffold(
      theme: theme,
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            FadeIn(
              delay: const Duration(milliseconds: 100),
              child: Text(
                'Hey @${stats.username} 👋',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 32,
                  fontWeight: FontWeight.w600,
                ),
                textAlign: TextAlign.center,
              ),
            ),
            const SizedBox(height: 16),
            FadeIn(
              delay: const Duration(milliseconds: 500),
              child: Text(
                "Here's your year in code",
                style: TextStyle(
                  color: theme.secondary,
                  fontSize: 22,
                  fontWeight: FontWeight.w500,
                ),
                textAlign: TextAlign.center,
              ),
            ),
            const SizedBox(height: 32),
            FadeIn(
              delay: const Duration(milliseconds: 900),
              child: Text(
                '${stats.year}',
                style: TextStyle(
                  color: theme.primary,
                  fontSize: 96,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
