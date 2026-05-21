import 'package:flutter/material.dart';
import '../models/wrapped_stats.dart';
import '../themes/archetype_themes.dart';
import 'slide_scaffold.dart';

class OutroSlide extends StatelessWidget {
  final WrappedStats stats;
  final ArchetypeTheme theme;
  const OutroSlide({super.key, required this.stats, required this.theme});

  @override
  Widget build(BuildContext context) {
    // Recap-only outro. Real share buttons live in the parent Next.js page
    // and reveal after `wrapped:ended` postMessage.
    return SlideScaffold(
      theme: theme,
      backgroundSeed: 59,
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            FadeIn(
              child: const SlideTitle('That was your year.'),
            ),
            const SizedBox(height: 18),
            ScaleIn(
              delay: const Duration(milliseconds: 250),
              from: 0.6,
              child: ShaderMask(
                shaderCallback: (rect) => LinearGradient(
                  colors: [theme.primary, theme.secondary],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ).createShader(rect),
                child: Text(
                  '@${stats.username}',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 38,
                    fontWeight: FontWeight.w900,
                    letterSpacing: -0.5,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 4),
            FadeIn(
              delay: const Duration(milliseconds: 600),
              child: Text(
                '${stats.year}',
                style: TextStyle(
                  color: Colors.white.withValues(alpha: 0.5),
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
            const SizedBox(height: 32),
            FadeIn(
              delay: const Duration(milliseconds: 900),
              child: Container(
                padding: const EdgeInsets.all(22),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.04),
                  border: Border.all(
                    color: theme.primary.withValues(alpha: 0.45),
                    width: 1.5,
                  ),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Column(
                  children: [
                    _RecapRow(
                      label: 'commits',
                      value: stats.totalCommits.toString(),
                      accent: theme.primary,
                    ),
                    const SizedBox(height: 12),
                    _RecapRow(
                      label: 'active days',
                      value: stats.totalActiveDays.toString(),
                      accent: theme.primary,
                    ),
                    const SizedBox(height: 12),
                    _RecapRow(
                      label: 'longest streak',
                      value: '${stats.longestStreak.days}d',
                      accent: theme.primary,
                    ),
                    const SizedBox(height: 12),
                    _RecapRow(
                      label: 'archetype',
                      value:
                          '${stats.archetype.emoji} ${stats.archetype.name}',
                      accent: theme.secondary,
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 28),
            FadeIn(
              delay: const Duration(milliseconds: 1500),
              child: const Text(
                'yearincode.com',
                style: TextStyle(
                  color: Colors.white54,
                  fontSize: 13,
                  letterSpacing: 1,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _RecapRow extends StatelessWidget {
  final String label;
  final String value;
  final Color accent;
  const _RecapRow({
    required this.label,
    required this.value,
    required this.accent,
  });
  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Text(
          label,
          style: const TextStyle(
            color: Colors.white60,
            fontSize: 13,
            letterSpacing: 1.2,
            fontWeight: FontWeight.w600,
          ),
        ),
        Flexible(
          child: Text(
            value,
            style: TextStyle(
              color: accent,
              fontWeight: FontWeight.w800,
              fontSize: 18,
            ),
            textAlign: TextAlign.right,
          ),
        ),
      ],
    );
  }
}
