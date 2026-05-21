import 'package:flutter/material.dart';
import '../themes/archetype_themes.dart';

/// Centred vertical layout shared by all slides. Background = the archetype's
/// theme background.
class SlideScaffold extends StatelessWidget {
  final ArchetypeTheme theme;
  final Widget child;
  final EdgeInsets padding;

  const SlideScaffold({
    super.key,
    required this.theme,
    required this.child,
    this.padding = const EdgeInsets.symmetric(horizontal: 32, vertical: 48),
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            theme.background,
            Color.alphaBlend(
              theme.primary.withValues(alpha: 0.18),
              theme.background,
            ),
          ],
        ),
      ),
      child: SafeArea(
        child: Padding(padding: padding, child: child),
      ),
    );
  }
}

class SlideTitle extends StatelessWidget {
  final String text;
  final Color color;
  const SlideTitle(this.text, {super.key, this.color = Colors.white70});
  @override
  Widget build(BuildContext context) => Text(
        text,
        style: TextStyle(
          color: color,
          fontSize: 18,
          fontWeight: FontWeight.w500,
          letterSpacing: 0.3,
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
          fontSize: 84,
          fontWeight: FontWeight.w800,
          height: 1.0,
        ),
        child: child,
      );
}

class FadeIn extends StatefulWidget {
  final Widget child;
  final Duration delay;
  final Duration duration;
  final Offset slideFrom;
  const FadeIn({
    super.key,
    required this.child,
    this.delay = Duration.zero,
    this.duration = const Duration(milliseconds: 700),
    this.slideFrom = const Offset(0, 0.06),
  });

  @override
  State<FadeIn> createState() => _FadeInState();
}

class _FadeInState extends State<FadeIn>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late Animation<double> _anim;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: widget.duration);
    _anim = CurvedAnimation(parent: _controller, curve: Curves.easeOutCubic);
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
          opacity: _anim.value,
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
