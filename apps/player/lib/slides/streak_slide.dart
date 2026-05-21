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
      backgroundSeed: 47,
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            FadeIn(child: const SlideTitle('Longest streak')),
            const SizedBox(height: 18),
            ScaleIn(
              delay: const Duration(milliseconds: 250),
              from: 0.5,
              child: ShaderMask(
                shaderCallback: (rect) => LinearGradient(
                  colors: [theme.primary, theme.secondary],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ).createShader(rect),
                child: Text(
                  '${s.days}',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 160,
                    fontWeight: FontWeight.w900,
                    height: 0.9,
                    letterSpacing: -6,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 8),
            FadeIn(
              delay: const Duration(milliseconds: 600),
              child: const Text(
                'days in a row.',
                style: TextStyle(
                  color: Colors.white70,
                  fontSize: 22,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
            const SizedBox(height: 32),
            FadeIn(
              delay: const Duration(milliseconds: 900),
              child: Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.04),
                  border: Border.all(
                    color: theme.primary.withValues(alpha: 0.4),
                  ),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: CalendarStreakGrid(
                  streakDays: s.days,
                  startCell: 80,
                  cellColor: theme.primary,
                ),
              ),
            ),
            const SizedBox(height: 18),
            if (s.from.isNotEmpty && s.to.isNotEmpty)
              FadeIn(
                delay: const Duration(milliseconds: 1500),
                child: StickerBadge(
                  text: '${s.from} → ${s.to}',
                  color: theme.secondary,
                  rotation: -0.04,
                ),
              ),
          ],
        ),
      ),
    );
  }
}
