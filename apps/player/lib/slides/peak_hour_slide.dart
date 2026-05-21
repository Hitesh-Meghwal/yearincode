import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../models/wrapped_stats.dart';
import '../themes/archetype_themes.dart';
import 'slide_scaffold.dart';

class PeakHourSlide extends StatefulWidget {
  final WrappedStats stats;
  final ArchetypeTheme theme;
  const PeakHourSlide({super.key, required this.stats, required this.theme});

  @override
  State<PeakHourSlide> createState() => _PeakHourSlideState();
}

class _PeakHourSlideState extends State<PeakHourSlide>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late Animation<double> _anim;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1800),
    );
    _anim = CurvedAnimation(parent: _controller, curve: Curves.easeOutBack);
    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  String _snark(int hour) {
    if (hour >= 0 && hour <= 4) return '👀 we see you';
    if (hour >= 5 && hour <= 8) return 'early bird energy';
    if (hour >= 9 && hour <= 11) return 'model citizen';
    if (hour == 12 || hour == 13) return 'lunch break legend';
    if (hour >= 14 && hour <= 17) return 'peak focus mode';
    if (hour >= 18 && hour <= 21) return 'post-dinner shipper';
    return 'night owl detected';
  }

  @override
  Widget build(BuildContext context) {
    final stats = widget.stats;
    final theme = widget.theme;
    return SlideScaffold(
      theme: theme,
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const SlideTitle('You commit most at'),
            const SizedBox(height: 24),
            SizedBox(
              width: 240,
              height: 240,
              child: AnimatedBuilder(
                animation: _anim,
                builder: (context, _) {
                  return CustomPaint(
                    painter: _ClockPainter(
                      hour: stats.peakHour,
                      progress: _anim.value,
                      ringColor: theme.primary,
                      handColor: theme.secondary,
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 24),
            Text(
              '${stats.peakHour.toString().padLeft(2, '0')}:00',
              style: TextStyle(
                color: theme.primary,
                fontSize: 56,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 4),
            Text('UTC · ${stats.peakHourCommits} commits',
                style:
                    const TextStyle(color: Colors.white60, fontSize: 14)),
            const SizedBox(height: 20),
            FadeIn(
              delay: const Duration(milliseconds: 1300),
              child: Text(
                _snark(stats.peakHour),
                style: TextStyle(
                  color: theme.secondary,
                  fontSize: 18,
                  fontStyle: FontStyle.italic,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ClockPainter extends CustomPainter {
  final int hour;
  final double progress;
  final Color ringColor;
  final Color handColor;
  _ClockPainter({
    required this.hour,
    required this.progress,
    required this.ringColor,
    required this.handColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2 - 8;
    final ring = Paint()
      ..color = ringColor.withValues(alpha: 0.25)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 4;
    canvas.drawCircle(center, radius, ring);
    // 12 ticks
    final tick = Paint()
      ..color = Colors.white.withValues(alpha: 0.4)
      ..strokeWidth = 2;
    for (var i = 0; i < 12; i += 1) {
      final a = (i / 12) * 2 * math.pi - math.pi / 2;
      final p1 = center + Offset(math.cos(a) * (radius - 8), math.sin(a) * (radius - 8));
      final p2 = center + Offset(math.cos(a) * radius, math.sin(a) * radius);
      canvas.drawLine(p1, p2, tick);
    }
    // Hand
    final hour12 = hour % 12;
    final targetAngle = (hour12 / 12) * 2 * math.pi - math.pi / 2;
    // Sweep from -pi/2 (12 o'clock) to targetAngle as progress goes 0->1.
    final angle = -math.pi / 2 + (targetAngle - (-math.pi / 2)) * progress;
    final hand = Paint()
      ..color = handColor
      ..strokeWidth = 4
      ..strokeCap = StrokeCap.round;
    canvas.drawLine(
      center,
      center + Offset(math.cos(angle), math.sin(angle)) * (radius - 16),
      hand,
    );
    // Pivot
    canvas.drawCircle(center, 6, Paint()..color = handColor);
  }

  @override
  bool shouldRepaint(covariant _ClockPainter old) =>
      old.progress != progress || old.hour != hour;
}
