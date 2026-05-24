import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../models/wrapped_stats.dart';
import '../themes/archetype_themes.dart';
import '../themes/wrapped_palette.dart';
import '../widgets/codicon.dart';
import 'slide_scaffold.dart';

/// Wrapped Pattern B — single massive stat. The number of commits to the
/// single top repo. Repo NAME is intentionally hidden (privacy guarantee:
/// share pages are public). A contribution-style square grid stands in
/// for the missing repo name.
class TopRepoSlide extends StatelessWidget {
  final WrappedStats stats;
  final ArchetypeTheme theme;
  const TopRepoSlide({super.key, required this.stats, required this.theme});

  @override
  Widget build(BuildContext context) {
    final repo = stats.topRepos.isNotEmpty ? stats.topRepos.first : null;
    final commits = repo?.commits ?? 0;

    return SlideScaffold(
      theme: theme,
      slideColor: WrappedPalette.topRepo,
      padding: EdgeInsets.zero,
      child: Stack(
        children: [
          // Folder codicon — ghosted top-right. Hints at "this is about a
          // repo" without needing to name it.
          Positioned(
            top: 48,
            right: 24,
            child: FadeIn(
              delay: const Duration(milliseconds: 80),
              child: Codicon(
                name: 'folder',
                size: 200,
                color: Colors.white.withValues(alpha: 0.10),
              ),
            ),
          ),

          // Kicker — top-left.
          Positioned(
            top: 56,
            left: 32,
            right: 32,
            child: FadeIn(
              delay: const Duration(milliseconds: 100),
              child: const _WrappedKicker(text: 'MY MAIN CHARACTER'),
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
                    child: Text(
                      '$commits',
                      maxLines: 1,
                      softWrap: false,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 220,
                        fontWeight: FontWeight.w400,
                        height: 1.15,
                        letterSpacing: -2,
                        fontFamily: 'Boldonse',
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 18),
                FadeIn(
                  delay: const Duration(milliseconds: 350),
                  child: const Text(
                    'commits to one repo',
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
                    'across ${stats.totalRepos} repos  ·  ${stats.totalCommits} commits total',
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

          // Contribution-style grid centered horizontally above the wordmark.
          Positioned(
            left: 32,
            right: 32,
            bottom: 80,
            child: FadeIn(
              delay: const Duration(milliseconds: 600),
              child: const Center(
                child: _RepoDensityGrid(
                  cols: 14,
                  rows: 6,
                  cell: 14,
                  gap: 3,
                  litCount: 25,
                  seed: 137,
                ),
              ),
            ),
          ),

          _WrappedWordmark(year: stats.year, username: stats.username),
        ],
      ),
    );
  }
}

/// Deterministic 14×6 grid. Lit cells stand in for the repo name we
/// intentionally hide for privacy.
class _RepoDensityGrid extends StatelessWidget {
  final int cols;
  final int rows;
  final double cell;
  final double gap;
  final int litCount;
  final int seed;
  const _RepoDensityGrid({
    required this.cols,
    required this.rows,
    required this.cell,
    required this.gap,
    required this.litCount,
    required this.seed,
  });

  @override
  Widget build(BuildContext context) {
    final total = cols * rows;
    final rng = math.Random(seed);
    final lit = <int>{};
    while (lit.length < litCount) {
      lit.add(rng.nextInt(total));
    }

    final width = cols * cell + (cols - 1) * gap;

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          'COMMIT DENSITY  ·  TOP REPO',
          style: TextStyle(
            color: Colors.white.withValues(alpha: 0.5),
            fontFamily: 'DepartureMono',
            fontSize: 10,
            fontWeight: FontWeight.w700,
            letterSpacing: 1.4,
          ),
        ),
        const SizedBox(height: 12),
        SizedBox(
          width: width,
          child: Wrap(
            spacing: gap,
            runSpacing: gap,
            children: List.generate(total, (i) {
              final isLit = lit.contains(i);
              return Container(
                width: cell,
                height: cell,
                decoration: BoxDecoration(
                  color: isLit
                      ? Colors.white.withValues(alpha: 0.92)
                      : Colors.white.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(2.5),
                ),
              );
            }),
          ),
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
          fontFamily: 'DepartureMono',
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
          fontFamily: 'DepartureMono',
          fontSize: 11,
          fontWeight: FontWeight.w600,
          letterSpacing: 1.2,
        ),
      ),
    );
  }
}
