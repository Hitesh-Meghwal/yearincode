import 'package:flutter/material.dart';
import '../models/wrapped_stats.dart';
import '../themes/archetype_themes.dart';
import '../widgets/calendar_grid.dart';
import 'slide_scaffold.dart';

class StreakSlide extends StatelessWidget {
  final WrappedStats stats;
  final ArchetypeTheme theme;
  const StreakSlide({super.key, required this.stats, required this.theme});

  @override
  Widget build(BuildContext context) {
    final s = stats.longestStreak;
    return SlideScaffold(
      theme: theme,
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const SlideTitle('Your longest streak'),
            const SizedBox(height: 16),
            Text(
              '${s.days}',
              style: TextStyle(
                color: theme.primary,
                fontSize: 96,
                fontWeight: FontWeight.w900,
                height: 1.0,
              ),
            ),
            const Text('days in a row',
                style: TextStyle(color: Colors.white70, fontSize: 18)),
            const SizedBox(height: 32),
            FadeIn(
              delay: const Duration(milliseconds: 400),
              child: CalendarStreakGrid(
                streakDays: s.days,
                startCell: 80,
                cellColor: theme.primary,
              ),
            ),
            const SizedBox(height: 24),
            if (s.from.isNotEmpty && s.to.isNotEmpty)
              FadeIn(
                delay: const Duration(milliseconds: 1400),
                child: Text(
                  '${s.from} → ${s.to}',
                  style: const TextStyle(color: Colors.white60),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
