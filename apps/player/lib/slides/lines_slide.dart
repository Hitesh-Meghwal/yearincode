import 'package:flutter/material.dart';
import '../models/wrapped_stats.dart';
import '../themes/archetype_themes.dart';
import 'slide_scaffold.dart';

class LinesSlide extends StatefulWidget {
  final WrappedStats stats;
  final ArchetypeTheme theme;
  const LinesSlide({super.key, required this.stats, required this.theme});

  @override
  State<LinesSlide> createState() => _LinesSlideState();
}

class _LinesSlideState extends State<LinesSlide>
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
    final stats = widget.stats;
    final theme = widget.theme;
    final maxValue =
        (stats.totalAdditions > stats.totalDeletions
                ? stats.totalAdditions
                : stats.totalDeletions)
            .clamp(1, 1 << 31);

    return SlideScaffold(
      theme: theme,
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const SlideTitle('Lines this year'),
            const SizedBox(height: 32),
            AnimatedBuilder(
              animation: _anim,
              builder: (context, _) {
                final p = _anim.value;
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _Bar(
                      label: '+ Additions',
                      value: stats.totalAdditions,
                      ratio: stats.totalAdditions / maxValue * p,
                      color: const Color(0xFF22C55E),
                    ),
                    const SizedBox(height: 18),
                    _Bar(
                      label: '- Deletions',
                      value: stats.totalDeletions,
                      ratio: stats.totalDeletions / maxValue * p,
                      color: const Color(0xFFEF4444),
                    ),
                  ],
                );
              },
            ),
            const SizedBox(height: 36),
            FadeIn(
              delay: const Duration(milliseconds: 1500),
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  color: theme.secondary.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  'Net: ${stats.netLines >= 0 ? '+' : ''}${_format(stats.netLines)}',
                  style: TextStyle(
                    color: theme.secondary,
                    fontWeight: FontWeight.w700,
                    fontSize: 16,
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

class _Bar extends StatelessWidget {
  final String label;
  final int value;
  final double ratio;
  final Color color;
  const _Bar({
    required this.label,
    required this.value,
    required this.ratio,
    required this.color,
  });
  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label,
                style: const TextStyle(
                    color: Colors.white70, fontWeight: FontWeight.w500)),
            Text(_format(value),
                style: const TextStyle(
                    color: Colors.white, fontWeight: FontWeight.w700)),
          ],
        ),
        const SizedBox(height: 6),
        LayoutBuilder(
          builder: (context, c) {
            final w = (c.maxWidth * ratio.clamp(0.0, 1.0));
            return Stack(
              children: [
                Container(
                  height: 14,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(999),
                  ),
                ),
                Container(
                  height: 14,
                  width: w,
                  decoration: BoxDecoration(
                    color: color,
                    borderRadius: BorderRadius.circular(999),
                  ),
                ),
              ],
            );
          },
        ),
      ],
    );
  }
}

String _format(int n) {
  final s = n.abs().toString();
  final buf = StringBuffer();
  for (var i = 0; i < s.length; i += 1) {
    if (i > 0 && (s.length - i) % 3 == 0) buf.write(',');
    buf.write(s[i]);
  }
  return n < 0 ? '-${buf.toString()}' : buf.toString();
}
