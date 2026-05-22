import 'package:flutter/material.dart';
import '../models/wrapped_stats.dart';
import '../themes/archetype_themes.dart';
import 'slide_scaffold.dart';

/// Magazine pull-quote treatment for the peak commit hour. The hour itself
/// becomes the page; everything else is editorial dressing.
class PeakHourSlide extends StatelessWidget {
  final WrappedStats stats;
  final ArchetypeTheme theme;
  const PeakHourSlide({super.key, required this.stats, required this.theme});

  String _snark(int hour) {
    if (hour >= 0 && hour <= 4) return 'we see you.';
    if (hour >= 5 && hour <= 8) return 'early bird, full inbox.';
    if (hour >= 9 && hour <= 11) return 'model citizen behaviour.';
    if (hour == 12 || hour == 13) return 'lunch break legend.';
    if (hour >= 14 && hour <= 17) return 'peak focus mode.';
    if (hour >= 18 && hour <= 21) return 'post-dinner shipper.';
    return 'night owl detected.';
  }

  @override
  Widget build(BuildContext context) {
    final hour = stats.peakHour;
    final hh = hour.toString().padLeft(2, '0');

    return SlideScaffold(
      theme: theme,
      backgroundSeed: 89,
      padding: EdgeInsets.zero,
      child: LayoutBuilder(
        builder: (context, constraints) {
          final w = constraints.maxWidth;
          final h = constraints.maxHeight;
          // 24-bar column on the right, sized inside the safe area so the
          // peak-hour callout ("← HH" + bar) cannot clip past the right edge.
          const railWidth = 70.0;
          // FittedBox below shrinks further if needed; cap kept at 110 so
          // "HH:00" is never taller than the safe header band.
          final hourFontSize = (w * 0.22).clamp(80.0, 110.0);

          return Stack(
            children: [
              // ------- the 24-hour rail, inside the right safe-area margin.
              Positioned(
                top: 40,
                bottom: 40,
                right: 25,
                width: railWidth,
                child: FadeIn(
                  slideFrom: const Offset(0.3, 0),
                  delay: const Duration(milliseconds: 200),
                  child: _HourRail(
                    peakHour: hour,
                    primary: theme.primary,
                  ),
                ),
              ),

              // ------- eyebrow caption.
              Positioned(
                top: 60,
                left: 28,
                child: FadeIn(
                  slideFrom: const Offset(-0.1, 0),
                  child: _MonoCaption('// PEAK · UTC'),
                ),
              ),

              // ------- HOUR, large, off-centre, mono. Sits left of the
              // rail with a comfortable margin so every glyph reads.
              Positioned(
                top: h * 0.20,
                left: 28,
                right: railWidth + 36,
                child: FadeIn(
                  delay: const Duration(milliseconds: 150),
                  slideFrom: const Offset(-0.06, 0.04),
                  child: FittedBox(
                    fit: BoxFit.scaleDown,
                    alignment: Alignment.topLeft,
                    child: Text(
                      '$hh:00',
                      maxLines: 1,
                      softWrap: false,
                      overflow: TextOverflow.visible,
                      style: TextStyle(
                        color: Colors.white,
                        fontFamily: 'monospace',
                        fontSize: hourFontSize,
                        fontWeight: FontWeight.w900,
                        height: 1.0,
                        letterSpacing: -3,
                      ),
                    ),
                  ),
                ),
              ),

              // ------- thick accent slab under the hour, anchoring the type.
              Positioned(
                left: 28,
                top: h * 0.20 + hourFontSize * 0.70,
                child: FadeIn(
                  delay: const Duration(milliseconds: 450),
                  slideFrom: const Offset(-0.15, 0),
                  child: Container(
                    width: 80,
                    height: 6,
                    color: theme.primary,
                  ),
                ),
              ),

              // ------- italic pull-quote, two lines, theme.secondary.
              Positioned(
                left: 28,
                right: railWidth + 36,
                bottom: 130,
                child: FadeIn(
                  delay: const Duration(milliseconds: 700),
                  slideFrom: const Offset(0, 0.08),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Big open quote glyph as design element.
                      Text(
                        '"',
                        style: TextStyle(
                          color: theme.secondary,
                          fontSize: 72,
                          fontWeight: FontWeight.w900,
                          height: 1.0,
                          fontStyle: FontStyle.italic,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          _snark(hour),
                          maxLines: 3,
                          style: TextStyle(
                            color: theme.secondary,
                            fontSize: 24,
                            fontWeight: FontWeight.w700,
                            fontStyle: FontStyle.italic,
                            height: 1.05,
                            letterSpacing: -0.5,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // ------- byline / data line at the bottom.
              Positioned(
                left: 28,
                right: railWidth + 36,
                bottom: 60,
                child: FadeIn(
                  delay: const Duration(milliseconds: 950),
                  child: Row(
                    children: [
                      Container(
                        width: 20,
                        height: 2,
                        color: Colors.white.withValues(alpha: 0.5),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          '${stats.peakHourCommits} COMMITS  ·  THIS HOUR, MORE THAN ANY OTHER',
                          maxLines: 2,
                          style: TextStyle(
                            color: Colors.white.withValues(alpha: 0.65),
                            fontFamily: 'monospace',
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 1.8,
                            height: 1.4,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

class _MonoCaption extends StatelessWidget {
  final String text;
  const _MonoCaption(this.text);
  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      style: TextStyle(
        color: Colors.white.withValues(alpha: 0.55),
        fontFamily: 'monospace',
        fontSize: 10,
        fontWeight: FontWeight.w700,
        letterSpacing: 2,
      ),
    );
  }
}

/// Vertical 24-row chart hugging the right edge. Each row = one hour. The
/// peak hour's row is a wide solid bar in [primary]; the rest are thin dim
/// ticks. Hour labels (00, 06, 12, 18) are dropped in as anchors.
class _HourRail extends StatelessWidget {
  final int peakHour;
  final Color primary;
  const _HourRail({required this.peakHour, required this.primary});

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        // Vertical area minus top/bottom margins.
        const vTop = 80.0;
        const vBottom = 80.0;
        final availableH = constraints.maxHeight - vTop - vBottom;
        final rowH = availableH / 24.0;

        return Stack(
          children: [
            for (var i = 0; i < 24; i += 1)
              Positioned(
                top: vTop + i * rowH,
                right: 12,
                child: _HourTick(
                  hour: i,
                  isPeak: i == peakHour,
                  primary: primary,
                  height: rowH,
                ),
              ),
            // Anchor labels.
            for (final anchor in const [0, 6, 12, 18])
              Positioned(
                top: vTop + anchor * rowH - 6,
                right: 18,
                child: Opacity(
                  opacity: anchor == peakHour ? 0 : 0.45,
                  child: Text(
                    anchor.toString().padLeft(2, '0'),
                    style: const TextStyle(
                      color: Colors.white,
                      fontFamily: 'monospace',
                      fontSize: 9,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 1,
                    ),
                  ),
                ),
              ),
          ],
        );
      },
    );
  }
}

class _HourTick extends StatelessWidget {
  final int hour;
  final bool isPeak;
  final Color primary;
  final double height;
  const _HourTick({
    required this.hour,
    required this.isPeak,
    required this.primary,
    required this.height,
  });

  @override
  Widget build(BuildContext context) {
    if (isPeak) {
      // The standout bar — wide, solid, with a small label callout.
      return Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Text(
            '← ${hour.toString().padLeft(2, '0')}',
            style: TextStyle(
              color: primary,
              fontFamily: 'monospace',
              fontSize: 10,
              fontWeight: FontWeight.w900,
              letterSpacing: 1,
            ),
          ),
          const SizedBox(width: 6),
          Container(
            width: 32,
            height: (height * 0.7).clamp(4.0, 14.0),
            color: primary,
          ),
        ],
      );
    }
    return Container(
      width: 12,
      height: (height * 0.35).clamp(1.5, 4.0),
      color: Colors.white.withValues(alpha: 0.18),
    );
  }
}
