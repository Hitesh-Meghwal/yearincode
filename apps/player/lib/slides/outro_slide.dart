import 'package:flutter/material.dart';
import '../models/wrapped_stats.dart';
import '../themes/archetype_themes.dart';
import 'slide_scaffold.dart';

/// "Concert ticket / receipt." The recap is a vertical ticket stub with a torn
/// top edge, mono header, dotted-leader stat rows, and a faux barcode at the
/// foot. The whole card is slightly rotated.
class OutroSlide extends StatelessWidget {
  final WrappedStats stats;
  final ArchetypeTheme theme;
  const OutroSlide({super.key, required this.stats, required this.theme});

  @override
  Widget build(BuildContext context) {
    return SlideScaffold(
      theme: theme,
      backgroundSeed: 59,
      padding: EdgeInsets.zero,
      child: Stack(
        children: [
          // Solid color block sitting on top of the scaffold's drifting bg.
          Positioned.fill(
            child: ColoredBox(color: theme.background.withValues(alpha: 0.85)),
          ),
          // The ticket card — slight rotation, asymmetric placement.
          Center(
            child: ScaleIn(
              from: 0.7,
              delay: const Duration(milliseconds: 200),
              child: Transform.rotate(
                angle: -0.025,
                child: _TicketCard(stats: stats, theme: theme),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _TicketCard extends StatelessWidget {
  final WrappedStats stats;
  final ArchetypeTheme theme;
  const _TicketCard({required this.stats, required this.theme});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 280,
      decoration: const BoxDecoration(
        color: Color(0xFFF6F1E7), // warm off-white "paper"
        border: Border(
          left: BorderSide(color: Colors.black, width: 3),
          right: BorderSide(color: Colors.black, width: 3),
          bottom: BorderSide(color: Colors.black, width: 3),
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Torn top edge.
          SizedBox(
            height: 12,
            child: CustomPaint(
              painter: _TearLinePainter(color: Colors.black),
            ),
          ),

          // Header band — solid theme.primary, mono uppercase.
          Container(
            color: theme.primary,
            padding: const EdgeInsets.fromLTRB(16, 10, 16, 10),
            child: FadeIn(
              delay: const Duration(milliseconds: 350),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'YEARINCODE',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 4,
                      fontFamily: 'monospace',
                      height: 1,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    '${stats.year} / @${stats.username}',
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.85),
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 1.4,
                      fontFamily: 'monospace',
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Stat rows with dotted-leader fill.
          Padding(
            padding: const EdgeInsets.fromLTRB(18, 14, 18, 10),
            child: Column(
              children: [
                _DottedRow(
                  label: 'COMMITS',
                  value: '${stats.totalCommits}',
                  delay: 500,
                ),
                _DottedRow(
                  label: 'ACTIVE DAYS',
                  value: '${stats.totalActiveDays}',
                  delay: 650,
                ),
                _DottedRow(
                  label: 'STREAK',
                  value: '${stats.longestStreak.days}D',
                  delay: 800,
                ),
                _DottedRow(
                  label: 'REPOS',
                  value: '${stats.totalRepos}',
                  delay: 950,
                ),
                _DottedRow(
                  label: 'ARCHETYPE',
                  value: stats.archetype.name.toUpperCase(),
                  delay: 1100,
                  accent: theme.primary,
                  emphasize: false,
                ),
              ],
            ),
          ),

          // Divider between rows and footer.
          const SizedBox(height: 4),
          _DashedDivider(),
          const SizedBox(height: 14),

          // Footer — barcode + url.
          Padding(
            padding: const EdgeInsets.fromLTRB(18, 0, 18, 16),
            child: FadeIn(
              delay: const Duration(milliseconds: 1300),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const _Barcode(),
                  const SizedBox(height: 10),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'yearincode.com',
                        style: TextStyle(
                          color: Colors.black,
                          fontSize: 11,
                          fontFamily: 'monospace',
                          fontWeight: FontWeight.w800,
                          letterSpacing: 1.2,
                        ),
                      ),
                      Text(
                        'ADMIT ONE',
                        style: TextStyle(
                          color: Colors.black.withValues(alpha: 0.55),
                          fontSize: 9,
                          fontFamily: 'monospace',
                          fontWeight: FontWeight.w700,
                          letterSpacing: 1.6,
                        ),
                      ),
                    ],
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

class _DottedRow extends StatelessWidget {
  final String label;
  final String value;
  final int delay;
  final Color? accent;
  final bool emphasize;
  const _DottedRow({
    required this.label,
    required this.value,
    required this.delay,
    this.accent,
    this.emphasize = true,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: FadeIn(
        delay: Duration(milliseconds: delay),
        slideFrom: const Offset(-0.05, 0),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              label,
              style: const TextStyle(
                color: Colors.black,
                fontSize: 10,
                fontFamily: 'monospace',
                fontWeight: FontWeight.w700,
                letterSpacing: 1.4,
                height: 1.6,
              ),
            ),
            // Dotted leaders fill the gap.
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 6),
                child: CustomPaint(
                  size: const Size.fromHeight(16),
                  painter: _DottedLeaderPainter(),
                ),
              ),
            ),
            // FittedBox keeps long values (e.g. long archetype names) from
            // pushing this row past the ticket's right edge.
            Flexible(
              child: FittedBox(
                fit: BoxFit.scaleDown,
                alignment: Alignment.centerRight,
                child: Text(
                  value,
                  maxLines: 1,
                  softWrap: false,
                  overflow: TextOverflow.visible,
                  style: TextStyle(
                    color: accent ?? Colors.black,
                    fontSize: emphasize ? 18 : 11,
                    fontWeight: FontWeight.w900,
                    letterSpacing: emphasize ? -0.5 : 1,
                    fontFamily: emphasize ? null : 'monospace',
                    height: 1,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Barcode extends StatelessWidget {
  const _Barcode();

  @override
  Widget build(BuildContext context) {
    // Deterministic faux barcode: alternating widths chosen by a seed string.
    const seed = 'YEARINCODE2026';
    final widths = <double>[];
    for (var i = 0; i < seed.length * 3; i++) {
      final code = seed.codeUnitAt(i % seed.length);
      final w = ((code + i * 7) % 5).toDouble();
      widths.add(w == 0 ? 1 : w);
    }
    return SizedBox(
      height: 32,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          for (var i = 0; i < widths.length; i++) ...[
            SizedBox(
              width: widths[i],
              child: Container(color: Colors.black),
            ),
            const SizedBox(width: 2),
          ],
        ],
      ),
    );
  }
}

class _DashedDivider extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 1,
      child: CustomPaint(
        painter: _DashedLinePainter(color: Colors.black.withValues(alpha: 0.6)),
        size: const Size.fromHeight(1),
      ),
    );
  }
}

class _DottedLeaderPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..color = Colors.black.withValues(alpha: 0.45);
    const dotR = 1.0;
    const step = 5.0;
    final y = size.height - 4;
    for (var x = 0.0; x < size.width; x += step) {
      canvas.drawCircle(Offset(x, y), dotR, paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _DashedLinePainter extends CustomPainter {
  final Color color;
  _DashedLinePainter({required this.color});
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = 1;
    const dash = 6.0;
    const gap = 4.0;
    var x = 0.0;
    final y = size.height / 2;
    while (x < size.width) {
      canvas.drawLine(Offset(x, y), Offset(x + dash, y), paint);
      x += dash + gap;
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _TearLinePainter extends CustomPainter {
  final Color color;
  _TearLinePainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    // Paper "paper" fill behind the zig-zag.
    final paperFill = Paint()..color = const Color(0xFFF6F1E7);
    final path = Path();
    const teeth = 14;
    final tw = size.width / teeth;
    path.moveTo(0, size.height);
    for (var i = 0; i < teeth; i++) {
      final x0 = i * tw;
      path.lineTo(x0 + tw / 2, 2);
      path.lineTo(x0 + tw, size.height);
    }
    path.close();
    canvas.drawPath(path, paperFill);

    // Outline stroke for the zig-zag.
    final stroke = Paint()
      ..color = color
      ..strokeWidth = 2.5
      ..style = PaintingStyle.stroke
      ..strokeJoin = StrokeJoin.miter;
    final outline = Path();
    outline.moveTo(0, size.height);
    for (var i = 0; i < teeth; i++) {
      final x0 = i * tw;
      outline.lineTo(x0 + tw / 2, 2);
      outline.lineTo(x0 + tw, size.height);
    }
    canvas.drawPath(outline, stroke);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
