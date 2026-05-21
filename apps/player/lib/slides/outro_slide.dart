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
    // and reveal after `wrapped:ended` postMessage — keeping them out of the
    // player avoids duplicate (and non-functional) share UI inside the iframe.
    return SlideScaffold(
      theme: theme,
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            FadeIn(
              child: Text(
                '@${stats.username}',
                style: TextStyle(
                  color: theme.primary,
                  fontSize: 28,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
            const SizedBox(height: 4),
            FadeIn(
              delay: const Duration(milliseconds: 200),
              child: Text(
                '${stats.year} in code',
                style: const TextStyle(color: Colors.white60, fontSize: 16),
              ),
            ),
            const SizedBox(height: 28),
            FadeIn(
              delay: const Duration(milliseconds: 500),
              child: Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.04),
                  border: Border.all(
                    color: theme.primary.withValues(alpha: 0.4),
                    width: 1.5,
                  ),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  children: [
                    _StatRow(
                      label: 'commits',
                      value: stats.totalCommits.toString(),
                    ),
                    const SizedBox(height: 8),
                    _StatRow(
                      label: 'active days',
                      value: stats.totalActiveDays.toString(),
                    ),
                    const SizedBox(height: 8),
                    _StatRow(
                      label: 'longest streak',
                      value: '${stats.longestStreak.days}d',
                    ),
                    const SizedBox(height: 8),
                    _StatRow(
                      label: 'archetype',
                      value: '${stats.archetype.emoji} ${stats.archetype.name}',
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 36),
            FadeIn(
              delay: const Duration(milliseconds: 1100),
              child: Text(
                'That was your year.',
                style: TextStyle(
                  color: theme.secondary,
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
            const SizedBox(height: 24),
            FadeIn(
              delay: const Duration(milliseconds: 1500),
              child: const Text(
                'yearincode.com',
                style: TextStyle(color: Colors.white54, fontSize: 13),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _StatRow extends StatelessWidget {
  final String label;
  final String value;
  const _StatRow({required this.label, required this.value});
  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: Colors.white60)),
        Flexible(
          child: Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w700,
            ),
            textAlign: TextAlign.right,
          ),
        ),
      ],
    );
  }
}
