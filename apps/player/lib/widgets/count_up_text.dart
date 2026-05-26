import 'package:flutter/material.dart';
import 'motion.dart';

/// Animates a number counting from 0 → [value] with ease-out cubic. Snaps
/// straight to the final value when the user has `prefers-reduced-motion`
/// set in their OS / browser.
class CountUpText extends StatefulWidget {
  final int value;
  final Duration duration;
  final TextStyle? style;
  final String prefix;
  final String suffix;
  final TextAlign? textAlign;

  const CountUpText({
    super.key,
    required this.value,
    this.duration = const Duration(milliseconds: 1800),
    this.style,
    this.prefix = '',
    this.suffix = '',
    this.textAlign,
  });

  @override
  State<CountUpText> createState() => _CountUpTextState();
}

class _CountUpTextState extends State<CountUpText>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late Animation<double> _animation;
  bool _started = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: widget.duration);
    _animation = CurvedAnimation(parent: _controller, curve: Curves.easeOutCubic);
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_started) return;
    _started = true;
    if (reduceMotionOf(context)) {
      _controller.value = 1.0;
    } else {
      _controller.forward();
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, _) {
        final current = (_animation.value * widget.value).round();
        final formatted = _formatNumber(current);
        return Text(
          '${widget.prefix}$formatted${widget.suffix}',
          style: widget.style,
          textAlign: widget.textAlign ?? TextAlign.center,
          maxLines: 1,
          softWrap: false,
        );
      },
    );
  }
}

String _formatNumber(int n) {
  final s = n.toString();
  final buf = StringBuffer();
  for (var i = 0; i < s.length; i += 1) {
    if (i > 0 && (s.length - i) % 3 == 0) buf.write(',');
    buf.write(s[i]);
  }
  return buf.toString();
}
