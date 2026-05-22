import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../themes/archetype_themes.dart';
import '../widgets/animated_background.dart';
import '../widgets/motion.dart';

/// Shared chrome for every slide. Drifting background + grain + safe-area
/// padding. Child = whatever the slide wants to render on top.
class SlideScaffold extends StatelessWidget {
  final ArchetypeTheme theme;
  final Widget child;
  final EdgeInsets padding;
  final int backgroundSeed;

  const SlideScaffold({
    super.key,
    required this.theme,
    required this.child,
    this.padding = const EdgeInsets.symmetric(horizontal: 32, vertical: 48),
    this.backgroundSeed = 7,
  });

  @override
  Widget build(BuildContext context) {
    return Stack(
      fit: StackFit.expand,
      children: [
        AnimatedBackground(
          primary: theme.primary,
          secondary: theme.secondary,
          background: theme.background,
          seed: backgroundSeed,
        ),
        SafeArea(
          child: Padding(padding: padding, child: child),
        ),
      ],
    );
  }
}

class SlideTitle extends StatelessWidget {
  final String text;
  final Color color;
  const SlideTitle(this.text, {super.key, this.color = Colors.white70});
  @override
  Widget build(BuildContext context) => Text(
        text.toUpperCase(),
        style: TextStyle(
          color: color,
          fontSize: 13,
          fontWeight: FontWeight.w700,
          letterSpacing: 3,
        ),
        textAlign: TextAlign.center,
      );
}

class HeroNumber extends StatelessWidget {
  final Widget child;
  const HeroNumber({super.key, required this.child});
  @override
  Widget build(BuildContext context) => DefaultTextStyle.merge(
        style: const TextStyle(
          color: Colors.white,
          fontSize: 120,
          fontWeight: FontWeight.w900,
          height: 0.95,
          letterSpacing: -3,
        ),
        child: child,
      );
}

/// Slightly rotated "sticker" pill. Adds collage energy next to hero numbers.
class StickerBadge extends StatelessWidget {
  final String text;
  final Color color;
  final double rotation;
  const StickerBadge({
    super.key,
    required this.text,
    required this.color,
    this.rotation = -0.06,
  });
  @override
  Widget build(BuildContext context) {
    return Transform.rotate(
      angle: rotation,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.16),
          borderRadius: BorderRadius.circular(999),
          border: Border.all(color: color.withValues(alpha: 0.55), width: 1.5),
        ),
        child: Text(
          text,
          style: TextStyle(
            color: color,
            fontWeight: FontWeight.w800,
            fontSize: 13,
            letterSpacing: 0.5,
          ),
        ),
      ),
    );
  }
}

class FadeIn extends StatefulWidget {
  final Widget child;
  final Duration delay;
  final Duration duration;
  final Offset slideFrom;
  final Curve curve;
  const FadeIn({
    super.key,
    required this.child,
    this.delay = Duration.zero,
    this.duration = const Duration(milliseconds: 700),
    this.slideFrom = const Offset(0, 0.06),
    this.curve = Curves.easeOutCubic,
  });

  @override
  State<FadeIn> createState() => _FadeInState();
}

class _FadeInState extends State<FadeIn>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late Animation<double> _anim;
  bool _started = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: widget.duration);
    _anim = CurvedAnimation(parent: _controller, curve: widget.curve);
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_started) return;
    _started = true;
    if (reduceMotionOf(context)) {
      _controller.value = 1.0;
      return;
    }
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
    return AnimatedBuilder(
      animation: _anim,
      builder: (context, _) {
        return Opacity(
          opacity: _anim.value.clamp(0.0, 1.0),
          child: Transform.translate(
            offset: Offset(
              widget.slideFrom.dx * 100 * (1 - _anim.value),
              widget.slideFrom.dy * 100 * (1 - _anim.value),
            ),
            child: widget.child,
          ),
        );
      },
    );
  }
}

/// Bounce-in scale animation. Used for big hero moments (archetype emoji,
/// intro year, recap card).
class ScaleIn extends StatefulWidget {
  final Widget child;
  final Duration delay;
  final Duration duration;
  final double from;
  const ScaleIn({
    super.key,
    required this.child,
    this.delay = Duration.zero,
    this.duration = const Duration(milliseconds: 900),
    this.from = 0.5,
  });
  @override
  State<ScaleIn> createState() => _ScaleInState();
}

class _ScaleInState extends State<ScaleIn>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late Animation<double> _anim;
  bool _started = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: widget.duration);
    _anim = CurvedAnimation(parent: _controller, curve: Curves.easeOutBack);
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_started) return;
    _started = true;
    if (reduceMotionOf(context)) {
      _controller.value = 1.0;
      return;
    }
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
    return AnimatedBuilder(
      animation: _anim,
      builder: (context, _) {
        final v = _anim.value;
        final scale = widget.from + (1 - widget.from) * v;
        return Transform.scale(
          scale: scale,
          child: Opacity(opacity: v.clamp(0.0, 1.0), child: widget.child),
        );
      },
    );
  }
}

/// Constant gentle pulse for icons/emoji that should feel alive.
class GentlePulse extends StatefulWidget {
  final Widget child;
  final double minScale;
  final double maxScale;
  final Duration period;
  const GentlePulse({
    super.key,
    required this.child,
    this.minScale = 0.97,
    this.maxScale = 1.03,
    this.period = const Duration(milliseconds: 2200),
  });
  @override
  State<GentlePulse> createState() => _GentlePulseState();
}

class _GentlePulseState extends State<GentlePulse>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  bool _started = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: widget.period);
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_started) return;
    _started = true;
    if (!reduceMotionOf(context)) {
      _controller.repeat(reverse: true);
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (reduceMotionOf(context)) {
      return widget.child;
    }
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, _) {
        final t = Curves.easeInOut.transform(_controller.value);
        final scale =
            widget.minScale + (widget.maxScale - widget.minScale) * t;
        return Transform.scale(scale: scale, child: widget.child);
      },
    );
  }
}

// Re-export math.pi for slide files that want to set their own rotation.
const double kHalfPi = math.pi / 2;
