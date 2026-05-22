import 'package:flutter/material.dart';
import '../models/wrapped_stats.dart';
import '../themes/archetype_themes.dart';
import '../widgets/calendar_grid.dart';
import 'slide_scaffold.dart';

/// "Calendar IS the art." The 52x7 grid takes ~65% of the slide; the streak
/// number is anchored bottom-left and partially overlaps the calendar in a
/// massive editorial slab. Mono caption + asymmetric "personal best" sticker.
class StreakSlide extends StatelessWidget {
  final WrappedStats stats;
  final ArchetypeTheme theme;
  const StreakSlide({super.key, required this.stats, required this.theme});

  @override
  Widget build(BuildContext context) {
    final s = stats.longestStreak;
    final hasRange = s.from.isNotEmpty && s.to.isNotEmpty;

    return SlideScaffold(
      theme: theme,
      backgroundSeed: 47,
      padding: EdgeInsets.zero,
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          // Mono caption, top-left, hard-edged.
          Positioned(
            left: 28,
            top: 60,
            right: 28,
            child: FadeIn(
              slideFrom: const Offset(-0.1, 0),
              child: Text(
                '// LONGEST STREAK',
                style: TextStyle(
                  color: theme.secondary,
                  fontSize: 11,
                  fontFamily: 'monospace',
                  letterSpacing: 2.4,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ),

          // Calendar grid — primary visual. Reduced ~12% via Transform.scale
          // and pulled inside the safe-area margins.
          Positioned(
            left: 28,
            right: 28,
            top: 130,
            child: FadeIn(
              delay: const Duration(milliseconds: 150),
              slideFrom: const Offset(0, 0.04),
              child: ClipRect(
                child: FittedBox(
                  fit: BoxFit.fitWidth,
                  alignment: Alignment.topCenter,
                  child: Transform.scale(
                    scale: 0.88,
                    alignment: Alignment.topCenter,
                    child: CalendarStreakGrid(
                      streakDays: s.days,
                      startCell: _streakStartCell(s.from),
                      cellColor: theme.primary,
                      baseColor: Colors.white.withValues(alpha: 0.06),
                    ),
                  ),
                ),
              ),
            ),
          ),

          // Streak number, anchored bottom-left. Capped at 110 and wrapped in
          // FittedBox so 3-digit values never overflow the safe area.
          Positioned(
            left: 28,
            right: 28,
            bottom: 110,
            child: ScaleIn(
              delay: const Duration(milliseconds: 350),
              from: 0.6,
              child: ShaderMask(
                shaderCallback: (rect) => LinearGradient(
                  colors: [theme.primary, theme.secondary],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ).createShader(rect),
                child: FittedBox(
                  fit: BoxFit.scaleDown,
                  alignment: Alignment.bottomLeft,
                  child: Text(
                    '${s.days}',
                    maxLines: 1,
                    softWrap: false,
                    overflow: TextOverflow.visible,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 110,
                      fontWeight: FontWeight.w900,
                      height: 1.0,
                      letterSpacing: -5,
                    ),
                  ),
                ),
              ),
            ),
          ),

          // Mono date-range caption, bottom-left under the big number.
          Positioned(
            left: 28,
            bottom: 50,
            right: 140,
            child: FadeIn(
              delay: const Duration(milliseconds: 800),
              child: DefaultTextStyle.merge(
                style: const TextStyle(
                  fontFamily: 'monospace',
                  fontSize: 10,
                  letterSpacing: 1.6,
                  height: 1.5,
                  fontWeight: FontWeight.w700,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'DAYS STRAIGHT',
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.95),
                        fontFamily: 'monospace',
                        fontSize: 11,
                        letterSpacing: 2,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    if (hasRange)
                      Text(
                        'FROM ${s.from} -> ${s.to}',
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.55),
                          fontFamily: 'monospace',
                          fontSize: 10,
                          letterSpacing: 1.4,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                  ],
                ),
              ),
            ),
          ),

          // "Personal best" sticker, pinned asymmetrically top-right, rotated.
          Positioned(
            right: 28,
            top: 90,
            child: FadeIn(
              delay: const Duration(milliseconds: 1100),
              slideFrom: const Offset(0.1, 0),
              child: Transform.rotate(
                angle: 0.06,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 11,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: theme.secondary,
                    border: Border.all(color: Colors.black, width: 2),
                  ),
                  child: Text(
                    'PERSONAL BEST',
                    style: const TextStyle(
                      color: Colors.black,
                      fontSize: 11,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 1.6,
                      fontFamily: 'monospace',
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  /// Map an ISO date (yyyy-mm-dd) to a cell index in the 52*7 grid so the
  /// streak shading lines up roughly with when in the year it happened.
  /// Falls back to ~mid-year if parsing fails.
  int _streakStartCell(String iso) {
    if (iso.length < 10) return 52 * 7 ~/ 2;
    final parsed = DateTime.tryParse(iso);
    if (parsed == null) return 52 * 7 ~/ 2;
    final start = DateTime(parsed.year, 1, 1);
    final days = parsed.difference(start).inDays;
    // Cells are laid out column-major (week, then day-of-week). We approximate
    // by week index so the highlight band lands in the right column.
    final week = (days / 7).floor().clamp(0, 51);
    final dow = (parsed.weekday % 7).clamp(0, 6); // Mon=1..Sun=7 -> 1..0
    return week * 7 + dow;
  }
}
