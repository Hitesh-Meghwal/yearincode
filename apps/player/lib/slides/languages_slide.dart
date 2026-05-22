import 'package:flutter/material.dart';
import '../models/wrapped_stats.dart';
import '../themes/archetype_themes.dart';
import 'slide_scaffold.dart';

// Five strong solid colours used for the supporting segments. Chosen to be
// punchy on a dark background without leaning into the user's archetype hue
// (which is reserved for the #1 language).
const List<Color> _segmentPalette = [
  Color(0xFFF5F1E8), // bone white
  Color(0xFFFFB400), // editorial yellow
  Color(0xFFFF4D6D), // hot pink-red
  Color(0xFF7CFFB2), // mint
  Color(0xFF6CA0FF), // sky blue
];

class LanguagesSlide extends StatelessWidget {
  final WrappedStats stats;
  final ArchetypeTheme theme;
  const LanguagesSlide({super.key, required this.stats, required this.theme});

  @override
  Widget build(BuildContext context) {
    final langs = stats.topLanguages;
    final top = langs.isNotEmpty ? langs.first : null;

    // Build segment list. #1 always uses theme.primary; the rest pull from the
    // fixed palette in order. Percentages are normalised so the bar fills.
    final segments = <_Segment>[];
    if (langs.isNotEmpty) {
      final total = langs.fold<double>(0, (s, l) => s + l.percentage);
      for (var i = 0; i < langs.length; i += 1) {
        final l = langs[i];
        final color =
            i == 0 ? theme.primary : _segmentPalette[(i - 1) % _segmentPalette.length];
        segments.add(_Segment(
          name: l.name,
          percentage: total > 0 ? (l.percentage / total) * 100 : 0,
          rawPercentage: l.percentage,
          color: color,
        ));
      }
    }

    return SlideScaffold(
      theme: theme,
      backgroundSeed: 113,
      padding: EdgeInsets.zero,
      child: LayoutBuilder(
        builder: (context, constraints) {
          final w = constraints.maxWidth;
          // Editorial scaling capped well inside the safe area.
          final heroFontSize = (w * 0.22).clamp(72.0, 110.0);

          return Stack(
            children: [
              // ------- mono caption, top-left, mirrors a magazine eyebrow.
              Positioned(
                top: 60,
                left: 28,
                child: FadeIn(
                  slideFrom: const Offset(-0.1, 0),
                  child: const _MonoCaption('// LANGUAGE SPLIT'),
                ),
              ),

              // ------- year tag, top-right.
              Positioned(
                top: 60,
                right: 28,
                child: FadeIn(
                  slideFrom: const Offset(0.1, 0),
                  child: _MonoCaption(stats.year.toString()),
                ),
              ),

              // ------- HERO: top language name. FittedBox+scaleDown keeps
              // every character readable when the language name is long
              // (e.g. "TypeScript", "Objective-C").
              Positioned(
                top: 130,
                left: 28,
                right: 28,
                child: FadeIn(
                  delay: const Duration(milliseconds: 150),
                  slideFrom: const Offset(0, 0.05),
                  child: FittedBox(
                    fit: BoxFit.scaleDown,
                    alignment: Alignment.topLeft,
                    child: Text(
                      top?.name.toLowerCase() ?? 'no code',
                      maxLines: 1,
                      overflow: TextOverflow.visible,
                      softWrap: false,
                      style: TextStyle(
                        color: theme.primary,
                        fontSize: heroFontSize,
                        fontWeight: FontWeight.w900,
                        height: 1.0,
                        letterSpacing: -4,
                      ),
                    ),
                  ),
                ),
              ),

              // ------- supporting #1 percentage line + sticker.
              if (top != null)
                Positioned(
                  top: 130 + heroFontSize * 0.92,
                  left: 28,
                  right: 28,
                  child: FadeIn(
                    delay: const Duration(milliseconds: 350),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          '${top.percentage.toStringAsFixed(0)}%',
                          style: const TextStyle(
                            color: Colors.white,
                            fontFamily: 'monospace',
                            fontSize: 18,
                            fontWeight: FontWeight.w700,
                            letterSpacing: -0.5,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            'OF ALL COMMITS',
                            style: TextStyle(
                              color: Colors.white.withValues(alpha: 0.55),
                              fontFamily: 'monospace',
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 2,
                            ),
                          ),
                        ),
                        StickerBadge(
                          text: '#1 LANGUAGE',
                          color: theme.secondary,
                          rotation: 0.04,
                        ),
                      ],
                    ),
                  ),
                ),

              // ------- the stacked segmented bar, inside safe area.
              Positioned(
                left: 28,
                right: 28,
                bottom: 180,
                child: FadeIn(
                  delay: const Duration(milliseconds: 600),
                  slideFrom: const Offset(-0.05, 0),
                  child: _SegmentedBar(segments: segments),
                ),
              ),

              // ------- legend rail at the bottom (callouts).
              Positioned(
                left: 28,
                right: 28,
                bottom: 60,
                child: FadeIn(
                  delay: const Duration(milliseconds: 900),
                  child: _LegendRail(segments: segments),
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

class _Segment {
  final String name;
  final double percentage; // normalised 0..100 across visible segments
  final double rawPercentage; // original % from stats
  final Color color;
  const _Segment({
    required this.name,
    required this.percentage,
    required this.rawPercentage,
    required this.color,
  });
}

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

/// Thick horizontal stacked bar. Each segment is a solid block; the segment
/// name + % is rendered ON the segment if there's room.
class _SegmentedBar extends StatelessWidget {
  final List<_Segment> segments;
  const _SegmentedBar({required this.segments});

  @override
  Widget build(BuildContext context) {
    if (segments.isEmpty) {
      return const SizedBox.shrink();
    }
    return LayoutBuilder(
      builder: (context, constraints) {
        final total = segments.fold<double>(0, (s, x) => s + x.percentage);
        return SizedBox(
          height: 76,
          width: constraints.maxWidth,
          child: Row(
            children: [
              for (final seg in segments)
                // Expanded (FlexFit.tight) forces each segment to fill its
                // proportional slot exactly so the bar ends flush with the
                // slide edge instead of leaving (or overflowing) a gap.
                Expanded(
                  flex: (seg.percentage * 1000).clamp(1, double.infinity).round(),
                  child: _BarSegment(segment: seg, total: total),
                ),
            ],
          ),
        );
      },
    );
  }
}

class _BarSegment extends StatelessWidget {
  final _Segment segment;
  final double total;
  const _BarSegment({required this.segment, required this.total});

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final w = constraints.maxWidth;
        // Only render label on the segment if it's wide enough.
        final showInline = w > 64;
        // Pick a readable text colour against the segment's background.
        final luminance = segment.color.computeLuminance();
        final fg = luminance > 0.5 ? Colors.black : Colors.white;
        return Container(
          height: 76,
          color: segment.color,
          alignment: Alignment.bottomLeft,
          padding: const EdgeInsets.fromLTRB(8, 6, 8, 6),
          child: showInline
              ? Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      segment.name.toUpperCase(),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        color: fg,
                        fontFamily: 'monospace',
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 1.2,
                      ),
                    ),
                    Text(
                      '${segment.rawPercentage.toStringAsFixed(0)}%',
                      style: TextStyle(
                        color: fg,
                        fontFamily: 'monospace',
                        fontSize: 15,
                        fontWeight: FontWeight.w900,
                        letterSpacing: -0.5,
                        height: 1,
                      ),
                    ),
                  ],
                )
              : const SizedBox.shrink(),
        );
      },
    );
  }
}

/// Bottom legend — small color dot + name + %. Used when segments are too
/// narrow to read inline, and as a redundant index for accessibility.
class _LegendRail extends StatelessWidget {
  final List<_Segment> segments;
  const _LegendRail({required this.segments});

  @override
  Widget build(BuildContext context) {
    if (segments.isEmpty) {
      return const SizedBox.shrink();
    }
    return Wrap(
      spacing: 18,
      runSpacing: 8,
      children: [
        for (final seg in segments)
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 10,
                height: 10,
                color: seg.color,
              ),
              const SizedBox(width: 8),
              Text(
                seg.name.toUpperCase(),
                style: const TextStyle(
                  color: Colors.white,
                  fontFamily: 'monospace',
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 1.5,
                ),
              ),
              const SizedBox(width: 6),
              Text(
                '${seg.rawPercentage.toStringAsFixed(0)}%',
                style: TextStyle(
                  color: Colors.white.withValues(alpha: 0.5),
                  fontFamily: 'monospace',
                  fontSize: 10,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 1.2,
                ),
              ),
            ],
          ),
      ],
    );
  }
}
