import 'dart:math' as math;
import 'package:flutter/material.dart';

class PieSlice {
  final String label;
  final double value;
  final Color color;
  const PieSlice({
    required this.label,
    required this.value,
    required this.color,
  });
}

/// Animated pie chart. Spins in over [duration].
class AnimatedPieChart extends StatefulWidget {
  final List<PieSlice> slices;
  final double size;
  final Duration duration;

  const AnimatedPieChart({
    super.key,
    required this.slices,
    this.size = 240,
    this.duration = const Duration(milliseconds: 1400),
  });

  @override
  State<AnimatedPieChart> createState() => _AnimatedPieChartState();
}

class _AnimatedPieChartState extends State<AnimatedPieChart>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late Animation<double> _anim;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: widget.duration);
    _anim = CurvedAnimation(parent: _controller, curve: Curves.easeOutCubic);
    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _anim,
      builder: (context, _) {
        return SizedBox(
          width: widget.size,
          height: widget.size,
          child: CustomPaint(
            painter: _PiePainter(
              slices: widget.slices,
              progress: _anim.value,
            ),
          ),
        );
      },
    );
  }
}

class _PiePainter extends CustomPainter {
  final List<PieSlice> slices;
  final double progress;
  _PiePainter({required this.slices, required this.progress});

  @override
  void paint(Canvas canvas, Size size) {
    final total = slices.fold<double>(0, (s, x) => s + x.value);
    if (total <= 0) return;
    final rect = Rect.fromLTWH(0, 0, size.width, size.height);
    var start = -math.pi / 2;
    for (final slice in slices) {
      final sweep = (slice.value / total) * 2 * math.pi * progress;
      final paint = Paint()..color = slice.color;
      canvas.drawArc(rect, start, sweep, true, paint);
      start += (slice.value / total) * 2 * math.pi;
    }
    // Donut hole.
    final hole = Paint()..color = Colors.black;
    canvas.drawCircle(
      Offset(size.width / 2, size.height / 2),
      size.width * 0.28,
      hole,
    );
  }

  @override
  bool shouldRepaint(covariant _PiePainter old) =>
      old.progress != progress || old.slices != slices;
}
