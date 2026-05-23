import 'package:flutter/material.dart';
import '../models/wrapped_stats.dart';
import '../themes/archetype_themes.dart';
import 'slide_scaffold.dart';

/// "The scorecard." A single 0–100 number derived from consistency,
/// streak, volume, and weekend balance. Sits between Streak and
/// Collaborator in the sequence — a quantified "how disciplined was your
/// year" moment.
class DisciplineSlide extends StatelessWidget {
  final WrappedStats stats;
  final ArchetypeTheme theme;
  const DisciplineSlide({super.key, required this.stats, required this.theme});

  String _grade(int score) {
    if (score >= 90) return 'ELITE';
    if (score >= 75) return 'LOCKED IN';
    if (score >= 60) return 'STEADY';
    if (score >= 40) return 'CASUAL';
    if (score >= 20) return 'SPORADIC';
    return 'JUST VISITING';
  }

  String _verdict(int score) {
    if (score >= 90) {
      return 'You ship like a machine. Sustainable, paced, relentless.';
    }
    if (score >= 75) {
      return 'You showed up. Most days, most weeks, real volume.';
    }
    if (score >= 60) {
      return 'A steady rhythm. Streaks held, work compounded.';
    }
    if (score >= 40) {
      return 'You came and went. Bursts of focus between gaps.';
    }
    if (score >= 20) {
      return 'A few sparks. Not yet a habit.';
    }
    return 'A quiet year. Plenty of room to build the streak next time.';
  }

  @override
  Widget build(BuildContext context) {
    final score = stats.disciplineScore.clamp(0, 100);

    return SlideScaffold(
      theme: theme,
      backgroundSeed: 149,
      padding: EdgeInsets.zero,
      child: Stack(
        children: [
          // Mono eyebrow caption, top-left.
          Positioned(
            top: 60,
            left: 28,
            right: 28,
            child: FadeIn(
              slideFrom: const Offset(-0.1, 0),
              child: Row(
                children: [
                  Container(width: 24, height: 2, color: Colors.white),
                  const SizedBox(width: 10),
                  Text(
                    'DISCIPLINE SCORE',
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.75),
                      fontFamily: 'monospace',
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 2.4,
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Massive score number, centered, gradient.
          Center(
            child: ScaleIn(
              from: 0.5,
              delay: const Duration(milliseconds: 200),
              duration: const Duration(milliseconds: 900),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  ShaderMask(
                    shaderCallback: (rect) => LinearGradient(
                      colors: [theme.primary, theme.secondary],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ).createShader(rect),
                    child: FittedBox(
                      fit: BoxFit.scaleDown,
                      child: Text(
                        '$score',
                        maxLines: 1,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 260,
                          fontWeight: FontWeight.w900,
                          height: 1.0,
                          letterSpacing: -10,
                          fontFamily: 'monospace',
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 6),
                  // "/ 100" suffix, small + mono.
                  Text(
                    'out of 100',
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.45),
                      fontFamily: 'monospace',
                      fontSize: 13,
                      letterSpacing: 2,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Grade pill — sticker style, rotated, bottom-right of center.
          Positioned(
            right: 28,
            top: 130,
            child: FadeIn(
              delay: const Duration(milliseconds: 700),
              slideFrom: const Offset(0.15, 0),
              child: Transform.rotate(
                angle: 0.06,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 7,
                  ),
                  decoration: BoxDecoration(
                    color: theme.secondary,
                    border: Border.all(color: Colors.black, width: 2.5),
                  ),
                  child: Text(
                    _grade(score),
                    style: const TextStyle(
                      color: Colors.black,
                      fontSize: 14,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 1.8,
                      fontFamily: 'monospace',
                    ),
                  ),
                ),
              ),
            ),
          ),

          // Verdict caption, bottom.
          Positioned(
            left: 28,
            right: 28,
            bottom: 80,
            child: FadeIn(
              delay: const Duration(milliseconds: 1100),
              child: Text(
                _verdict(score),
                style: TextStyle(
                  color: Colors.white.withValues(alpha: 0.78),
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  height: 1.35,
                  letterSpacing: -0.3,
                ),
              ),
            ),
          ),

          // Tiny footer — the four pillars, as a quiet caption.
          Positioned(
            left: 28,
            right: 28,
            bottom: 48,
            child: FadeIn(
              delay: const Duration(milliseconds: 1350),
              child: Text(
                'consistency · streak · volume · balance',
                style: TextStyle(
                  color: Colors.white.withValues(alpha: 0.32),
                  fontFamily: 'monospace',
                  fontSize: 10,
                  letterSpacing: 1.6,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
