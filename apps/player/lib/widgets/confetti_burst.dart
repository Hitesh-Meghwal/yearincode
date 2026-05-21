import 'dart:math' as math;
import 'package:flutter/material.dart';

/// One-shot confetti burst from the top of its bounds. Particles fall with
/// gravity, rotate, and fade. Pure CustomPaint — no dependencies.
class ConfettiBurst extends StatefulWidget {
  final List<Color> colors;
  final int particleCount;
  final Duration duration;
  final Duration delay;

  const ConfettiBurst({
    super.key,
    required this.colors,
    this.particleCount = 60,
    this.duration = const Duration(milliseconds: 3500),
    this.delay = Duration.zero,
  });

  @override
  State<ConfettiBurst> createState() => _ConfettiBurstState();
}

class _ConfettiBurstState extends State<ConfettiBurst>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final List<_Particle> _particles;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: widget.duration);
    final rng = math.Random(13);
    _particles = List.generate(widget.particleCount, (i) {
      return _Particle(
        startX: rng.nextDouble(),
        vx: (rng.nextDouble() - 0.5) * 0.6,
        vy: 0.4 + rng.nextDouble() * 0.5,
        size: 4 + rng.nextDouble() * 6,
        rotation: rng.nextDouble() * math.pi * 2,
        rotationSpeed: (rng.nextDouble() - 0.5) * 6,
        color: widget.colors[rng.nextInt(widget.colors.length)],
        delay: rng.nextDouble() * 0.2,
      );
    });
    Future.delayed(widget.delay, () {
      if (mounted) _controller.forward();
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return IgnorePointer(
      child: AnimatedBuilder(
        animation: _controller,
        builder: (context, _) {
          return CustomPaint(
            painter: _ConfettiPainter(
              particles: _particles,
              t: _controller.value,
            ),
            size: Size.infinite,
          );
        },
      ),
    );
  }
}

class _Particle {
  final double startX, vx, vy, size, rotation, rotationSpeed, delay;
  final Color color;
  const _Particle({
    required this.startX,
    required this.vx,
    required this.vy,
    required this.size,
    required this.rotation,
    required this.rotationSpeed,
    required this.color,
    required this.delay,
  });
}

class _ConfettiPainter extends CustomPainter {
  final List<_Particle> particles;
  final double t;
  _ConfettiPainter({required this.particles, required this.t});

  @override
  void paint(Canvas canvas, Size size) {
    for (final p in particles) {
      final localT = ((t - p.delay) / (1 - p.delay)).clamp(0.0, 1.0);
      if (localT <= 0) continue;
      // Position: gravity-style fall.
      final x = (p.startX + p.vx * localT) * size.width;
      final y = (-0.08 + p.vy * localT + 0.6 * localT * localT) * size.height;
      // Fade out near the end.
      final alpha = (1 - localT).clamp(0.0, 1.0);
      if (alpha <= 0) continue;
      final paint = Paint()..color = p.color.withValues(alpha: alpha);
      canvas.save();
      canvas.translate(x, y);
      canvas.rotate(p.rotation + p.rotationSpeed * localT);
      canvas.drawRect(
        Rect.fromCenter(
          center: Offset.zero,
          width: p.size,
          height: p.size * 0.6,
        ),
        paint,
      );
      canvas.restore();
    }
  }

  @override
  bool shouldRepaint(covariant _ConfettiPainter old) => old.t != t;
}
