import 'package:flutter/material.dart';
import '../models/wrapped_stats.dart';
import '../themes/archetype_themes.dart';
import '../themes/wrapped_palette.dart';
import '../widgets/count_up_text.dart';
import 'slide_scaffold.dart';

/// Wrapped Pattern B — doubled. Top half: additions. Bottom half: deletions.
/// A small net-lines caption sits between the two.
class LinesSlide extends StatelessWidget {
  final WrappedStats stats;
  final ArchetypeTheme theme;
  const LinesSlide({super.key, required this.stats, required this.theme});

  static const Color _addColor = Color(0xFF22C55E);
  static const Color _delColor = Color(0xFFEF4444);

  @override
  Widget build(BuildContext context) {
    return SlideScaffold(
      theme: theme,
      slideColor: WrappedPalette.lines,
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
              child: const _WrappedKicker(text: 'MY LINES'),
            ),
          ),

          // Body — additions block (top) and deletions block (bottom),
          // separated by a sub-caption row.
          Positioned.fill(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(32, 110, 32, 80),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: FadeIn(
                      delay: const Duration(milliseconds: 200),
                      slideFrom: const Offset(-0.04, 0),
                      child: _StatHalf(
                        value: stats.totalAdditions,
                        label: '+ added',
                        valueColor: _addColor,
                        labelColor: _addColor,
                      ),
                    ),
                  ),
                  // Net delta caption between the two halves.
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 4),
                    child: FadeIn(
                      delay: const Duration(milliseconds: 700),
                      child: Text(
                        'net  ${stats.netLines >= 0 ? '+' : ''}${_format(stats.netLines)}',
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.78),
                          fontFamily: 'DepartureMono',
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 1.6,
                        ),
                      ),
                    ),
                  ),
                  Expanded(
                    child: FadeIn(
                      delay: const Duration(milliseconds: 450),
                      slideFrom: const Offset(0.04, 0),
                      child: _StatHalf(
                        value: stats.totalDeletions,
                        label: '− deleted',
                        valueColor: _delColor,
                        labelColor: _delColor,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          _WrappedWordmark(year: stats.year, username: stats.username),
        ],
      ),
    );
  }
}

class _StatHalf extends StatelessWidget {
  final int value;
  final String label;
  final Color valueColor;
  final Color labelColor;
  const _StatHalf({
    required this.value,
    required this.label,
    required this.valueColor,
    required this.labelColor,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        FittedBox(
          fit: BoxFit.scaleDown,
          alignment: Alignment.centerLeft,
          child: CountUpText(
            value: value,
            duration: const Duration(milliseconds: 1600),
            textAlign: TextAlign.left,
            style: TextStyle(
              color: valueColor,
              fontSize: 150,
              fontWeight: FontWeight.w400,
              height: 1.15,
              letterSpacing: -1.5,
              fontFamily: 'Boldonse',
            ),
          ),
        ),
        const SizedBox(height: 12),
        Text(
          label,
          style: TextStyle(
            color: labelColor,
            fontSize: 24,
            fontWeight: FontWeight.w800,
            letterSpacing: -0.4,
          ),
        ),
      ],
    );
  }
}

String _format(int n) {
  final s = n.abs().toString();
  final buf = StringBuffer();
  for (var i = 0; i < s.length; i += 1) {
    if (i > 0 && (s.length - i) % 3 == 0) buf.write(',');
    buf.write(s[i]);
  }
  return n < 0 ? '-${buf.toString()}' : buf.toString();
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
          fontSize: 11,
          fontWeight: FontWeight.w700,
          letterSpacing: 2.2,
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
