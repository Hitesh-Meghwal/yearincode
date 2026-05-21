import 'dart:math' as math;
import 'package:flutter/material.dart';

/// Slow-drifting soft color blobs + a faint grain layer. Sits behind every
/// slide's content so the screen always feels alive — no dead static
/// backgrounds. Cheap on a single AnimationController, no extra deps.
class AnimatedBackground extends StatefulWidget {
  final Color primary;
  final Color secondary;
  final Color background;
  final int blobCount;
  final int seed;

  const AnimatedBackground({
    super.key,
    required this.primary,
    required this.secondary,
    required this.background,
    this.blobCount = 4,
    this.seed = 7,
  });

  @override
  State<AnimatedBackground> createState() => _AnimatedBackgroundState();
}

class _AnimatedBackgroundState extends State<AnimatedBackground>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final List<_Blob> _blobs;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 18),
    )..repeat();
    final rng = math.Random(widget.seed);
    _blobs = List.generate(widget.blobCount, (i) {
      final color = i.isEven ? widget.primary : widget.secondary;
      return _Blob(
        color: color,
        baseX: rng.nextDouble(),
        baseY: rng.nextDouble(),
        amplitudeX: 0.15 + rng.nextDouble() * 0.2,
        amplitudeY: 0.15 + rng.nextDouble() * 0.2,
        phase: rng.nextDouble() * math.pi * 2,
        radius: 0.4 + rng.nextDouble() * 0.4,
        opacity: 0.18 + rng.nextDouble() * 0.18,
      );
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, _) {
        return CustomPaint(
          painter: _BackgroundPainter(
            blobs: _blobs,
            t: _controller.value,
            background: widget.background,
            primary: widget.primary,
          ),
          size: Size.infinite,
        );
      },
    );
  }
}

class _Blob {
  final Color color;
  final double baseX, baseY, amplitudeX, amplitudeY, phase, radius, opacity;
  const _Blob({
    required this.color,
    required this.baseX,
    required this.baseY,
    required this.amplitudeX,
    required this.amplitudeY,
    required this.phase,
    required this.radius,
    required this.opacity,
  });
}

class _BackgroundPainter extends CustomPainter {
  final List<_Blob> blobs;
  final double t;
  final Color background;
  final Color primary;

  _BackgroundPainter({
    required this.blobs,
    required this.t,
    required this.background,
    required this.primary,
  });

  @override
  void paint(Canvas canvas, Size size) {
    // Solid base.
    canvas.drawRect(
      Offset.zero & size,
      Paint()..color = background,
    );

    // Diagonal gradient overlay for richness.
    canvas.drawRect(
      Offset.zero & size,
      Paint()
        ..shader = LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            background,
            Color.alphaBlend(primary.withValues(alpha: 0.18), background),
          ],
        ).createShader(Offset.zero & size),
    );

    // Drifting soft blobs. Heavy blur via MaskFilter.
    final twoPi = math.pi * 2;
    for (final blob in blobs) {
      final cx = (blob.baseX +
              math.sin(twoPi * t + blob.phase) * blob.amplitudeX) *
          size.width;
      final cy = (blob.baseY +
              math.cos(twoPi * t + blob.phase * 1.3) * blob.amplitudeY) *
          size.height;
      final r = blob.radius * math.min(size.width, size.height);
      final paint = Paint()
        ..color = blob.color.withValues(alpha: blob.opacity)
        ..maskFilter = MaskFilter.blur(BlurStyle.normal, r * 0.6);
      canvas.drawCircle(Offset(cx, cy), r, paint);
    }

    // Faint grain — deterministic per-pixel dots, sampled coarsely.
    final grain = Paint()..color = Colors.white.withValues(alpha: 0.012);
    final rng = math.Random(91); // deterministic
    final count = (size.width * size.height / 1800).toInt();
    for (var i = 0; i < count; i += 1) {
      final x = rng.nextDouble() * size.width;
      final y = rng.nextDouble() * size.height;
      canvas.drawRect(Rect.fromLTWH(x, y, 1, 1), grain);
    }
  }

  @override
  bool shouldRepaint(covariant _BackgroundPainter old) =>
      old.t != t || old.background != background;
}
