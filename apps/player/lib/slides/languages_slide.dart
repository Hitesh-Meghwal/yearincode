import 'package:flutter/material.dart';
import '../models/wrapped_stats.dart';
import '../themes/archetype_themes.dart';
import '../widgets/pie_chart.dart';
import 'slide_scaffold.dart';

const List<Color> _palette = [
  Color(0xFF60A5FA),
  Color(0xFFF59E0B),
  Color(0xFFEC4899),
  Color(0xFF10B981),
  Color(0xFFA78BFA),
];

class LanguagesSlide extends StatelessWidget {
  final WrappedStats stats;
  final ArchetypeTheme theme;
  const LanguagesSlide({super.key, required this.stats, required this.theme});

  @override
  Widget build(BuildContext context) {
    final slices = <PieSlice>[];
    for (var i = 0; i < stats.topLanguages.length; i += 1) {
      final l = stats.topLanguages[i];
      slices.add(PieSlice(
        label: l.name,
        value: l.commits.toDouble(),
        color: _palette[i % _palette.length],
      ));
    }

    final top = stats.topLanguages.isNotEmpty ? stats.topLanguages.first : null;

    return SlideScaffold(
      theme: theme,
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const SlideTitle('Your top language was'),
            const SizedBox(height: 16),
            if (top != null)
              Text(
                top.name,
                style: TextStyle(
                  color: theme.primary,
                  fontSize: 56,
                  fontWeight: FontWeight.w900,
                ),
              ),
            const SizedBox(height: 8),
            if (top != null)
              Text(
                '${top.percentage}% of your commits',
                style: const TextStyle(color: Colors.white70, fontSize: 18),
              ),
            const SizedBox(height: 32),
            if (slices.isNotEmpty)
              AnimatedPieChart(slices: slices, size: 240),
            const SizedBox(height: 24),
            FadeIn(
              delay: const Duration(milliseconds: 1400),
              child: Wrap(
                spacing: 12,
                runSpacing: 8,
                alignment: WrapAlignment.center,
                children: [
                  for (var i = 0; i < stats.topLanguages.length; i += 1)
                    _LangChip(
                      color: _palette[i % _palette.length],
                      label:
                          '${stats.topLanguages[i].name} ${stats.topLanguages[i].percentage}%',
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _LangChip extends StatelessWidget {
  final Color color;
  final String label;
  const _LangChip({required this.color, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 10,
          height: 10,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 6),
        Text(label,
            style: const TextStyle(color: Colors.white, fontSize: 14)),
      ],
    );
  }
}
