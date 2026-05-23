import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../models/wrapped_stats.dart';
import '../themes/archetype_themes.dart';
import '../themes/wrapped_palette.dart';
import '../widgets/count_up_text.dart';
import 'slide_scaffold.dart';

/// Wrapped Pattern B — single massive stat. The commit count occupies the
/// middle band of the slide. Sub-caption with active days + repos below.
/// A deterministic 52-week activity strip near the bottom fills the empty
/// space with data-viz instead of editorial chrome.
class CommitsSlide extends StatelessWidget {
  final WrappedStats stats;
  final ArchetypeTheme theme;
  const CommitsSlide({super.key, required this.stats, required this.theme});

  @override
  Widget build(BuildContext context) {
    return SlideScaffold(
      theme: theme,
      slideColor: WrappedPalette.commits,
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
              child: const _WrappedKicker(text: 'MY COMMITS'),
            ),
          ),

          // Hero block — anchored at top: 130.
          Positioned(
            top: 130,
            left: 32,
            right: 32,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ScaleIn(
                  delay: const Duration(milliseconds: 200),
                  from: 0.6,
                  child: FittedBox(
                    fit: BoxFit.scaleDown,
                    alignment: Alignment.centerLeft,
                    child: CountUpText(
                      value: stats.totalCommits,
                      duration: const Duration(milliseconds: 1600),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 200,
                        fontWeight: FontWeight.w900,
                        height: 1.0,
                        letterSpacing: -6,
                        fontFamily: 'monospace',
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 6),
                FadeIn(
                  delay: const Duration(milliseconds: 350),
                  child: const Text(
                    'commits this year',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 26,
                      fontWeight: FontWeight.w800,
                      height: 1.1,
                      letterSpacing: -0.5,
                    ),
                  ),
                ),
                const SizedBox(height: 14),
                FadeIn(
                  delay: const Duration(milliseconds: 500),
                  child: Text(
                    'across ${stats.totalRepos} repos  ·  ${stats.totalActiveDays} active days',
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.7),
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 0.2,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // 52-week activity strip pinned above the wordmark.
          Positioned(
            left: 32,
            right: 32,
            bottom: 80,
            child: FadeIn(
              delay: const Duration(milliseconds: 700),
              child: const _WeeksStrip(seed: 73, litCount: 28),
            ),
          ),

          _WrappedWordmark(year: stats.year, username: stats.username),
        ],
      ),
    );
  }
}

/// Deterministic 52-square activity row. Lit positions chosen via a seeded
/// PRNG so the result looks like commit cadence, not a uniform pattern.
class _WeeksStrip extends StatelessWidget {
  final int seed;
  final int litCount;
  const _WeeksStrip({required this.seed, required this.litCount});

  @override
  Widget build(BuildContext context) {
    const totalWeeks = 52;
    final rng = math.Random(seed);
    final lit = <int>{};
    while (lit.length < litCount) {
      lit.add(rng.nextInt(totalWeeks));
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '52 WEEKS OF COMMITS',
          style: TextStyle(
            color: Colors.white.withValues(alpha: 0.5),
            fontFamily: 'monospace',
            fontSize: 10,
            fontWeight: FontWeight.w700,
            letterSpacing: 1.4,
          ),
        ),
        const SizedBox(height: 10),
        LayoutBuilder(
          builder: (context, constraints) {
            const gap = 4.0;
            final cell = ((constraints.maxWidth - gap * (totalWeeks - 1)) /
                    totalWeeks)
                .clamp(4.0, 9.0);
            return SizedBox(
              height: cell,
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: List.generate(totalWeeks, (i) {
                  final isLit = lit.contains(i);
                  return Padding(
                    padding: EdgeInsets.only(
                        right: i == totalWeeks - 1 ? 0 : gap),
                    child: Container(
                      width: cell,
                      height: cell,
                      decoration: BoxDecoration(
                        color: isLit
                            ? Colors.white.withValues(alpha: 0.92)
                            : Colors.white.withValues(alpha: 0.08),
                        borderRadius: BorderRadius.circular(1.5),
                      ),
                    ),
                  );
                }),
              ),
            );
          },
        ),
      ],
    );
  }
}

class _WrappedKicker extends StatelessWidget {
  final String text;
  const _WrappedKicker({required this.text});
  @override
  Widget build(BuildContext context) => Text(
        text,
        style: TextStyle(
          color: Colors.white.withValues(alpha: 0.78),
          fontFamily: 'monospace',
          fontSize: 12,
          fontWeight: FontWeight.w700,
          letterSpacing: 2.4,
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
          color: Colors.white.withValues(alpha: 0.5),
          fontFamily: 'monospace',
          fontSize: 11,
          fontWeight: FontWeight.w600,
          letterSpacing: 1.2,
        ),
      ),
    );
  }
}
