import 'package:flutter/material.dart';

/// Animates a number counting from 0 → [value] with elastic-ish easing.
class CountUpText extends StatefulWidget {
  final int value;
  final Duration duration;
  final TextStyle? style;
  final String prefix;
  final String suffix;

  const CountUpText({
    super.key,
    required this.value,
    this.duration = const Duration(milliseconds: 1800),
    this.style,
    this.prefix = '',
    this.suffix = '',
  });

  @override
  State<CountUpText> createState() => _CountUpTextState();
}

class _CountUpTextState extends State<CountUpText>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: widget.duration);
    _animation = CurvedAnimation(parent: _controller, curve: Curves.easeOutCubic);
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
      animation: _animation,
      builder: (context, _) {
        final current = (_animation.value * widget.value).round();
        final formatted = _formatNumber(current);
        return Text(
          '${widget.prefix}$formatted${widget.suffix}',
          style: widget.style,
          textAlign: TextAlign.center,
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
