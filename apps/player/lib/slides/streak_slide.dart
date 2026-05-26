import 'package:flutter/material.dart';
import '../models/wrapped_stats.dart';
import '../themes/archetype_themes.dart';
import '../themes/wrapped_palette.dart';
import '../widgets/calendar_grid.dart';
import '../widgets/codicon.dart';
import '../widgets/count_up_text.dart';
import 'slide_scaffold.dart';

/// Wrapped Pattern B — single massive stat. The longest streak in days,
/// with a from→to range as the sub-caption. The lower half renders the
/// 52-week calendar grid with the streak window highlighted.
class StreakSlide extends StatelessWidget {
  final WrappedStats stats;
  final ArchetypeTheme theme;
  const StreakSlide({super.key, required this.stats, required this.theme});

  /// Map an ISO date (yyyy-mm-dd) to a cell index in the 52×7 grid. The
  /// grid is laid out column-major (each column is a week of 7 days), so
  /// cell = weekOfYear * 7 + dayOfWeek. Defaults to 0 if the date is
  /// missing/unparseable.
  int _streakStartCell(String iso) {
    if (iso.isEmpty) return 0;
    final d = DateTime.tryParse(iso);
    if (d == null) return 0;
    final jan1 = DateTime(d.year, 1, 1);
    final dayOfYear = d.difference(jan1).inDays; // 0-based
    final week = (dayOfYear ~/ 7).clamp(0, 51);
    final dow = (dayOfYear % 7).clamp(0, 6);
    return week * 7 + dow;
  }

  @override
  Widget build(BuildContext context) {
    final s = stats.longestStreak;
    final hasRange = s.from.isNotEmpty && s.to.isNotEmpty;

    return SlideScaffold(
      theme: theme,
      slideColor: WrappedPalette.streak,
      padding: EdgeInsets.zero,
      child: Stack(
        children: [
          // Big flame codicon — floats top-right at low opacity. Reads as
          // "this slide is about heat / continuity" before the eye lands on
          // the number.
          Positioned(
            top: 60,
            right: 28,
            child: FadeIn(
              delay: const Duration(milliseconds: 80),
              child: Codicon(
                name: 'flame',
                size: 180,
                color: Colors.white.withValues(alpha: 0.14),
              ),
            ),
          ),

          // Kicker — top-left.
          Positioned(
            top: 56,
            left: 32,
            right: 32,
            child: FadeIn(
              delay: const Duration(milliseconds: 100),
              child: const _WrappedKicker(text: 'MY LONGEST STREAK'),
            ),
          ),

          // Hero block — anchored at top: 130.
          Positioned(
            top: 130,
            left: 32,
            right: 32,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ScaleIn(
                  delay: const Duration(milliseconds: 200),
                  from: 0.6,
                  child: FittedBox(
                    fit: BoxFit.scaleDown,
                    alignment: Alignment.centerLeft,
                    child: CountUpText(
                      value: s.days,
                      duration: const Duration(milliseconds: 1600),
                      textAlign: TextAlign.left,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 220,
                        fontWeight: FontWeight.w400,
                        height: 1.15,
                        letterSpacing: -2,
                        fontFamily: 'Boldonse',
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 18),
                FadeIn(
                  delay: const Duration(milliseconds: 350),
                  child: const Text(
                    'days straight',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 26,
                      fontWeight: FontWeight.w800,
                      height: 1.1,
                      letterSpacing: -0.5,
                    ),
                  ),
                ),
                const SizedBox(height: 14),
                if (hasRange)
                  FadeIn(
                    delay: const Duration(milliseconds: 500),
                    child: Text(
                      'from ${s.from} to ${s.to}',
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.7),
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 1.2,
                        fontFamily: 'DepartureMono',
                      ),
                    ),
                  ),
              ],
            ),
          ),

          // 52-week calendar grid — lower band. Scales to the full slide
          // width via FittedBox so neither the cells nor the streak window
          // overflows on narrow viewports.
          Positioned(
            left: 32,
            right: 32,
            bottom: 80,
            child: FadeIn(
              delay: const Duration(milliseconds: 650),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '52 WEEKS  ·  STREAK HIGHLIGHTED',
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.5),
                      fontFamily: 'DepartureMono',
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 1.4,
                    ),
                  ),
                  const SizedBox(height: 10),
                  ClipRect(
                    child: FittedBox(
                      fit: BoxFit.fitWidth,
                      alignment: Alignment.bottomCenter,
                      child: CalendarStreakGrid(
                        streakDays: s.days,
                        startCell: _streakStartCell(s.from),
                        cellColor: Colors.white,
                        baseColor: Colors.white.withValues(alpha: 0.10),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          _WrappedWordmark(year: stats.year, username: stats.username),
        ],
      ),
    );
  }
}

class _WrappedKicker extends StatelessWidget {
  final String text;
  const _WrappedKicker({required this.text});
  @override
  Widget build(BuildContext context) => Text(
        text,
        style: TextStyle(
          color: Colors.white.withValues(alpha: 0.78),
          fontFamily: 'DepartureMono',
          fontSize: 12,
          fontWeight: FontWeight.w700,
          letterSpacing: 2.4,
        ),
      );
}

class _WrappedWordmark extends StatelessWidget {
  final int year;
  final String username;
  const _WrappedWordmark({required this.year, required this.username});
  @override
  Widget build(BuildContext context) {
    return Positioned(
      right: 28,
      bottom: 28,
      child: Text(
        'yearincode  ·  $year  ·  @$username',
        style: TextStyle(
          color: Colors.white.withValues(alpha: 0.5),
          fontFamily: 'DepartureMono',
          fontSize: 11,
          fontWeight: FontWeight.w600,
          letterSpacing: 1.2,
        ),
      ),
    );
  }
}
