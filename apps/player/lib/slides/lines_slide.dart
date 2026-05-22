import 'package:flutter/material.dart';
import '../models/wrapped_stats.dart';
import '../themes/archetype_themes.dart';
import 'slide_scaffold.dart';

/// Type as bars. Two solid color blocks stacked — green for + additions,
/// red for - deletions. The numbers live INSIDE the blocks at 90px+. The
/// "+"/"-" glyphs are oversized, hugging the left edge of each block.
/// A yellow NET sticker crosses the boundary between the two blocks.
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
      backgroundSeed: 103,
      padding: EdgeInsets.zero,
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          // KICKER — top-left, magazine masthead.
          Positioned(
            top: 60,
            left: 32,
            right: 32,
            child: FadeIn(
              delay: const Duration(milliseconds: 100),
              slideFrom: const Offset(-0.15, 0),
              child: Row(
                children: [
                  Container(width: 24, height: 2, color: Colors.white),
                  const SizedBox(width: 10),
                  Text(
                    'CHAPTER 02 / DIFF',
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.75),
                      fontFamily: 'monospace',
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 2.4,
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Two stacked color blocks fill the middle of the slide.
          Positioned.fill(
            top: 120,
            bottom: 120,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 28),
              child: Column(
                children: [
                  // ADDITIONS BLOCK — label/number anchored top-right so the
                  // centered NET sticker (sitting on the seam between blocks)
                  // cannot overlap the ADDITIONS label.
                  Expanded(
                    child: FadeIn(
                      delay: const Duration(milliseconds: 250),
                      slideFrom: const Offset(-0.08, 0),
                      duration: const Duration(milliseconds: 800),
                      child: _Block(
                        glyph: '+',
                        value: stats.totalAdditions,
                        background: _addColor,
                        label: 'ADDITIONS',
                        textColor: Colors.black,
                        alignGlyph: Alignment.bottomLeft,
                        alignNumber: Alignment.topRight,
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  // DELETIONS BLOCK — label/number anchored bottom-right so
                  // the centered NET sticker (which sits ON the seam) cannot
                  // overlap the DELETIONS label.
                  Expanded(
                    child: FadeIn(
                      delay: const Duration(milliseconds: 500),
                      slideFrom: const Offset(0.08, 0),
                      duration: const Duration(milliseconds: 800),
                      child: _Block(
                        glyph: '-',
                        value: stats.totalDeletions,
                        background: _delColor,
                        label: 'DELETIONS',
                        textColor: Colors.black,
                        alignGlyph: Alignment.topLeft,
                        alignNumber: Alignment.bottomRight,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // NET delta — yellow sticker straddling the seam between the two blocks.
          Positioned(
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            child: IgnorePointer(
              child: Align(
                alignment: Alignment.center,
                child: FadeIn(
                  delay: const Duration(milliseconds: 1100),
                  slideFrom: const Offset(0, 0.04),
                  child: Transform.rotate(
                    angle: -0.04,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 18, vertical: 10),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFDE047), // hard yellow
                        border: Border.all(color: Colors.black, width: 2.5),
                        boxShadow: const [
                          BoxShadow(
                            color: Colors.black,
                            offset: Offset(4, 4),
                          ),
                        ],
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'NET',
                            style: TextStyle(
                              color: Colors.black,
                              fontFamily: 'monospace',
                              fontSize: 9,
                              fontWeight: FontWeight.w900,
                              letterSpacing: 2.2,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            '${stats.netLines >= 0 ? '+' : ''}${_format(stats.netLines)}',
                            style: const TextStyle(
                              color: Colors.black,
                              fontSize: 22,
                              fontWeight: FontWeight.w900,
                              height: 1.0,
                              letterSpacing: -0.8,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),

          // FOOTER caption — bottom-left, mono.
          Positioned(
            left: 32,
            right: 32,
            bottom: 60,
            child: FadeIn(
              delay: const Duration(milliseconds: 1250),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Flexible(
                    child: Text(
                      'LINES TOUCHED, ${stats.year}',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.7),
                        fontFamily: 'monospace',
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 2,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Flexible(
                    child: Text(
                      '@${stats.username}',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.7),
                        fontFamily: 'monospace',
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 1.6,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// A single solid color block with an oversized glyph in one corner and the
/// formatted number in the opposite corner. The composition itself is the
/// chart — no progress bars, no tracks.
class _Block extends StatelessWidget {
  final String glyph;
  final int value;
  final Color background;
  final Color textColor;
  final String label;
  final Alignment alignGlyph;
  final Alignment alignNumber;

  const _Block({
    required this.glyph,
    required this.value,
    required this.background,
    required this.textColor,
    required this.label,
    required this.alignGlyph,
    required this.alignNumber,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(color: background),
      child: Stack(
        clipBehavior: Clip.hardEdge,
        children: [
          // Oversized + or - glyph hugging one corner (kept inside the block).
          Positioned(
            left: alignGlyph.x < 0 ? 8 : null,
            right: alignGlyph.x > 0 ? 8 : null,
            top: alignGlyph.y < 0 ? -10 : null,
            bottom: alignGlyph.y > 0 ? -20 : null,
            child: Text(
              glyph,
              style: TextStyle(
                color: textColor.withValues(alpha: 0.85),
                fontSize: 200,
                fontWeight: FontWeight.w900,
                height: 1.0,
                letterSpacing: -8,
              ),
            ),
          ),

          // The number — in the opposite corner. Constrained left+right so
          // the formatted value can never overflow the block.
          Positioned(
            left: 22,
            right: 22,
            top: alignNumber.y < 0 ? 22 : null,
            bottom: alignNumber.y > 0 ? 22 : null,
            child: Column(
              crossAxisAlignment: alignNumber.x > 0
                  ? CrossAxisAlignment.end
                  : CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  label,
                  style: TextStyle(
                    color: textColor.withValues(alpha: 0.75),
                    fontFamily: 'monospace',
                    fontSize: 10,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 2.8,
                  ),
                ),
                const SizedBox(height: 4),
                FittedBox(
                  fit: BoxFit.scaleDown,
                  alignment: alignNumber.x > 0
                      ? Alignment.centerRight
                      : Alignment.centerLeft,
                  child: Text(
                    _format(value),
                    textAlign: alignNumber.x > 0
                        ? TextAlign.right
                        : TextAlign.left,
                    maxLines: 1,
                    softWrap: false,
                    style: TextStyle(
                      color: textColor,
                      fontSize: 38,
                      fontWeight: FontWeight.w900,
                      height: 1.0,
                      letterSpacing: -1.4,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
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
