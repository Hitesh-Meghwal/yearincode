import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../models/wrapped_stats.dart';
import '../themes/archetype_themes.dart';
import '../themes/wrapped_palette.dart';
import '../widgets/codicon.dart';
import 'slide_scaffold.dart';

/// Wrapped Pattern B — single massive stat. The peak hour HH:00 fills the
/// middle band; UTC label sits underneath; sub-caption ties it to the
/// commit count at that hour. A vertical 24-row hour distribution chart
/// fills the right edge with data-viz.
class PeakHourSlide extends StatelessWidget {
  final WrappedStats stats;
  final ArchetypeTheme theme;
  const PeakHourSlide({super.key, required this.stats, required this.theme});

  @override
  Widget build(BuildContext context) {
    final hh = stats.peakHour.toString().padLeft(2, '0');

    return SlideScaffold(
      theme: theme,
      slideColor: WrappedPalette.peakHour,
      padding: EdgeInsets.zero,
      child: Stack(
        children: [
          // Oversized clockface codicon — ghosted, sitting low-left behind
          // the time. Visual cue for "this is about when you ship".
          Positioned(
            left: -40,
            bottom: 60,
            child: FadeIn(
              delay: const Duration(milliseconds: 80),
              child: Codicon(
                name: 'clockface',
                size: 320,
                color: Colors.white.withValues(alpha: 0.06),
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
              child: const _WrappedKicker(text: 'MY PEAK HOUR'),
            ),
          ),

          // Hero block — anchored at top: 130, leaves room for right-edge chart.
          Positioned(
            top: 130,
            left: 32,
            right: 110,
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
                      '$hh:00',
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
                    'UTC',
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
                    '${stats.peakHourCommits} commits at this hour, more than any other',
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.7),
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 0.2,
                      height: 1.4,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // 24-row hour distribution chart on the right edge.
          Positioned(
            top: 110,
            bottom: 80,
            right: 24,
            width: 70,
            child: FadeIn(
              delay: const Duration(milliseconds: 600),
              child: _HourBarChart(peakHour: stats.peakHour),
            ),
          ),

          _WrappedWordmark(year: stats.year, username: stats.username),
        ],
      ),
    );
  }
}

/// Vertical 24-row bar chart. Each row is one hour; widths peak at
/// [peakHour] and fall off via wraparound distance, with a touch of
/// seeded noise so the chart reads as plausible activity.
class _HourBarChart extends StatelessWidget {
  final int peakHour;
  const _HourBarChart({required this.peakHour});

  @override
  Widget build(BuildContext context) {
    final rng = math.Random(peakHour * 1000 + 17);
    // Deterministic plausible distribution.
    final widths = List<double>.generate(24, (h) {
      final raw = (h - peakHour) % 24;
      final dist = math.min(raw, 24 - raw); // wraparound distance 0..12
      // Symmetric falloff: peak=1.0, neighbours~0.8, opposite~0.10.
      final base = math.max(0.10, 1.0 - (dist / 12.0) * 0.92);
      // Sprinkle in deterministic noise so it doesn't look mechanical.
      final noise = (rng.nextDouble() - 0.5) * 0.20;
      return (base + noise).clamp(0.08, 1.0);
    });

    return LayoutBuilder(
      builder: (context, constraints) {
        final h = constraints.maxHeight;
        final rowHeight = h / 24;
        final barHeight = (rowHeight * 0.6).clamp(2.0, 6.0);
        const labelWidth = 26.0;
        final maxBarWidth = constraints.maxWidth - labelWidth - 4;

        return Stack(
          children: List.generate(24, (i) {
            final isPeak = i == peakHour;
            final w = widths[i] * maxBarWidth;
            return Positioned(
              top: i * rowHeight + (rowHeight - barHeight) / 2,
              right: 0,
              left: 0,
              height: barHeight,
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  // Bar grows from the right edge so the chart sits against
                  // the slide edge cleanly.
                  Expanded(
                    child: Stack(
                      alignment: Alignment.centerRight,
                      children: [
                        Container(
                          width: w,
                          height: barHeight,
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(
                                alpha: isPeak ? 0.95 : 0.55),
                            borderRadius: BorderRadius.circular(1),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 4),
                  SizedBox(
                    width: labelWidth,
                    child: isPeak
                        ? Text(
                            '← ${peakHour.toString().padLeft(2, '0')}',
                            style: const TextStyle(
                              color: Colors.white,
                              fontFamily: 'DepartureMono',
                              fontSize: 9,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 0.4,
                            ),
                          )
                        : const SizedBox.shrink(),
                  ),
                ],
              ),
            );
          }),
        );
      },
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
