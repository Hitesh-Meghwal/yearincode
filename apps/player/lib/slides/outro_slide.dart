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
            const SizedBox(height: 32),
            FadeIn(
              delay: const Duration(milliseconds: 1100),
              child: const Text(
                'Share your wrapped',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
            const SizedBox(height: 16),
            FadeIn(
              delay: const Duration(milliseconds: 1400),
              child: Wrap(
                spacing: 10,
                runSpacing: 10,
                alignment: WrapAlignment.center,
                children: [
                  _SharePill(label: 'X', color: theme.primary),
                  _SharePill(label: 'LinkedIn', color: theme.primary),
                  _SharePill(label: 'Reddit', color: theme.primary),
                  _SharePill(label: 'Copy link', color: theme.secondary),
                ],
              ),
            ),
            const SizedBox(height: 32),
            FadeIn(
              delay: const Duration(milliseconds: 1800),
              child: const Text(
                'Generate yours → yearincode.com',
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

class _SharePill extends StatelessWidget {
  final String label;
  final Color color;
  const _SharePill({required this.label, required this.color});
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.18),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: color.withValues(alpha: 0.4)),
      ),
      child: Text(
        label,
        style: TextStyle(color: color, fontWeight: FontWeight.w600),
      ),
    );
  }
}
