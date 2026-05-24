import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../models/wrapped_stats.dart';
import '../themes/archetype_themes.dart';
import '../themes/wrapped_palette.dart';
import 'slide_scaffold.dart';

/// Wrapped Pattern C — recap. A concert-ticket stub sits on the yellow
/// slide bg, slightly rotated. Header band carries the wordmark + year,
/// stat rows use dotted-leader rule, faux barcode at the bottom.
class OutroSlide extends StatelessWidget {
  final WrappedStats stats;
  final ArchetypeTheme theme;
  const OutroSlide({super.key, required this.stats, required this.theme});

  static const Color _ink = Color(0xFF1A1A1A);

  @override
  Widget build(BuildContext context) {
    return SlideScaffold(
      theme: theme,
      slideColor: WrappedPalette.outro,
      padding: EdgeInsets.zero,
      child: Stack(
        children: [
          // Ticket stub — centered, subtly rotated.
          Positioned.fill(
            child: Center(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 70, 20, 70),
                child: ScaleIn(
                  delay: const Duration(milliseconds: 150),
                  from: 0.85,
                  child: Transform.rotate(
                    angle: -0.02,
                    child: _TicketStub(stats: stats),
                  ),
                ),
              ),
            ),
          ),

          // Wordmark — dark ink on the yellow.
          Positioned(
            right: 28,
            bottom: 28,
            child: Text(
              'yearincode  ·  ${stats.year}  ·  @${stats.username}',
              style: TextStyle(
                color: _ink.withValues(alpha: 0.5),
                fontFamily: 'DepartureMono',
                fontSize: 11,
                fontWeight: FontWeight.w600,
                letterSpacing: 1.2,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _TicketStub extends StatelessWidget {
  final WrappedStats stats;
  const _TicketStub({required this.stats});

  static const Color _ink = Color(0xFF1A1A1A);
  static const Color _card = Color(0xFFF8F4EA);
  static const Color _headerBand = WrappedPalette.commits; // violet
  static const double _cardWidth = 400;
  static const int _tearSegments = 18;
  static const double _tearHeight = 13;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: _cardWidth,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Zig-zag tear line at the top, matching the header band color.
          CustomPaint(
            size: const Size(_cardWidth, _tearHeight),
            painter: _ZigZagPainter(
              color: _headerBand,
              segments: _tearSegments,
            ),
          ),
          // Card body.
          Container(
            decoration: BoxDecoration(
              color: _card,
              borderRadius: const BorderRadius.only(
                bottomLeft: Radius.circular(8),
                bottomRight: Radius.circular(8),
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.18),
                  blurRadius: 22,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Header band.
                Container(
                  width: double.infinity,
                  color: _headerBand,
                  padding: const EdgeInsets.fromLTRB(24, 22, 24, 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'YEARINCODE',
                        style: TextStyle(
                          color: Colors.white,
                          fontFamily: 'DepartureMono',
                          fontSize: 32,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 5,
                          height: 1.0,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        '${stats.year}  ·  @${stats.username}',
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.85),
                          fontFamily: 'DepartureMono',
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 1.8,
                          height: 1.1,
                        ),
                      ),
                    ],
                  ),
                ),
                // Stat rows.
                Padding(
                  padding: const EdgeInsets.fromLTRB(24, 22, 24, 18),
                  child: Column(
                    children: [
                      _TicketStatRow(
                        label: 'COMMITS',
                        value: '${stats.totalCommits}',
                      ),
                      _TicketStatRow(
                        label: 'ACTIVE DAYS',
                        value: '${stats.totalActiveDays}',
                      ),
                      _TicketStatRow(
                        label: 'STREAK',
                        value: '${stats.longestStreak.days}D',
                      ),
                      _TicketStatRow(
                        label: 'DISCIPLINE',
                        value: '${stats.disciplineScore}/100',
                      ),
                      _TicketStatRow(
                        label: 'ARCHETYPE',
                        value:
                            '${stats.archetype.emoji} ${stats.archetype.name.toUpperCase()}',
                        scaleValue: true,
                      ),
                    ],
                  ),
                ),
                // Dashed divider above the barcode.
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: CustomPaint(
                    size: const Size(double.infinity, 1),
                    painter: _DashedLinePainter(color: _ink.withValues(alpha: 0.35)),
                  ),
                ),
                // Faux barcode.
                Padding(
                  padding: const EdgeInsets.fromLTRB(24, 18, 24, 12),
                  child: SizedBox(
                    height: 38,
                    child: CustomPaint(
                      size: const Size(double.infinity, 38),
                      painter: _BarcodePainter(seed: stats.username.hashCode),
                    ),
                  ),
                ),
                // Footer row: yearincode.com  ·  ADMIT ONE.
                Padding(
                  padding: const EdgeInsets.fromLTRB(24, 0, 24, 20),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'yearincode.com',
                        style: TextStyle(
                          color: _ink,
                          fontFamily: 'DepartureMono',
                          fontSize: 13,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 0.4,
                        ),
                      ),
                      Text(
                        'ADMIT ONE',
                        style: TextStyle(
                          color: _ink.withValues(alpha: 0.55),
                          fontFamily: 'DepartureMono',
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 2.2,
                        ),
                      ),
                    ],
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

class _TicketStatRow extends StatelessWidget {
  final String label;
  final String value;
  final bool scaleValue;
  const _TicketStatRow({
    required this.label,
    required this.value,
    this.scaleValue = false,
  });

  static const Color _ink = Color(0xFF1A1A1A);

  @override
  Widget build(BuildContext context) {
    final valueWidget = Text(
      value,
      maxLines: 1,
      softWrap: false,
      overflow: TextOverflow.ellipsis,
      textAlign: TextAlign.right,
      style: const TextStyle(
        color: _ink,
        fontFamily: 'DepartureMono',
        fontSize: 17,
        fontWeight: FontWeight.w900,
        letterSpacing: 0.2,
        height: 1.1,
      ),
    );

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 7),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Text(
            label,
            style: TextStyle(
              color: _ink.withValues(alpha: 0.78),
              fontFamily: 'DepartureMono',
              fontSize: 13,
              fontWeight: FontWeight.w700,
              letterSpacing: 1.4,
            ),
          ),
          const SizedBox(width: 10),
          // Dotted-leader fill.
          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(bottom: 3),
              child: CustomPaint(
                size: const Size(double.infinity, 2),
                painter: _DottedLeaderPainter(
                  color: _ink.withValues(alpha: 0.30),
                ),
              ),
            ),
          ),
          const SizedBox(width: 10),
          ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 200),
            child: scaleValue
                ? FittedBox(
                    fit: BoxFit.scaleDown,
                    alignment: Alignment.centerRight,
                    child: valueWidget,
                  )
                : valueWidget,
          ),
        ],
      ),
    );
  }
}

class _ZigZagPainter extends CustomPainter {
  final Color color;
  final int segments;
  _ZigZagPainter({required this.color, required this.segments});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..color = color;
    final segWidth = size.width / segments;
    final path = Path();
    // Top edge sits flat on the slide; teeth point downward into the card.
    path.moveTo(0, 0);
    for (var i = 0; i < segments; i++) {
      final startX = i * segWidth;
      final midX = startX + segWidth / 2;
      final endX = (i + 1) * segWidth;
      path.lineTo(startX, 0);
      path.lineTo(midX, size.height);
      path.lineTo(endX, 0);
    }
    path.lineTo(size.width, 0);
    path.close();
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant _ZigZagPainter old) =>
      old.color != color || old.segments != segments;
}

class _DashedLinePainter extends CustomPainter {
  final Color color;
  _DashedLinePainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = 1;
    const dash = 4.0;
    const gap = 4.0;
    double x = 0;
    while (x < size.width) {
      canvas.drawLine(
        Offset(x, size.height / 2),
        Offset(math.min(x + dash, size.width), size.height / 2),
        paint,
      );
      x += dash + gap;
    }
  }

  @override
  bool shouldRepaint(covariant _DashedLinePainter old) => old.color != color;
}

class _DottedLeaderPainter extends CustomPainter {
  final Color color;
  _DottedLeaderPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;
    const spacing = 4.0;
    const radius = 1.0;
    double x = radius;
    while (x < size.width) {
      canvas.drawCircle(Offset(x, size.height / 2), radius, paint);
      x += spacing;
    }
  }

  @override
  bool shouldRepaint(covariant _DottedLeaderPainter old) => old.color != color;
}

class _BarcodePainter extends CustomPainter {
  final int seed;
  _BarcodePainter({required this.seed});

  @override
  void paint(Canvas canvas, Size size) {
    final rng = math.Random(seed);
    final paint = Paint()..color = Colors.black;
    double x = 0;
    while (x < size.width) {
      // Alternating black bars and gaps of varying widths.
      final barWidth = 1.0 + rng.nextDouble() * 3.5;
      final gapWidth = 1.0 + rng.nextDouble() * 2.0;
      if (x + barWidth > size.width) break;
      canvas.drawRect(Rect.fromLTWH(x, 0, barWidth, size.height), paint);
      x += barWidth + gapWidth;
    }
  }

  @override
  bool shouldRepaint(covariant _BarcodePainter old) => old.seed != seed;
}
