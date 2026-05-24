import 'package:flutter/material.dart';
import '../models/wrapped_stats.dart';
import '../themes/archetype_themes.dart';
import '../themes/wrapped_palette.dart';
import '../widgets/motion.dart';
import 'slide_scaffold.dart';

/// Wrapped Pattern B — single massive stat. The 0–100 discipline score
/// occupies the middle band. Grade word + animated progress bar +
/// verdict sit below.
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
      slideColor: WrappedPalette.discipline,
      padding: EdgeInsets.zero,
      child: Stack(
        children: [
          // Kicker — top-left.
          Positioned(
            top: 56,
            left: 32,
            right: 32,
            child: FadeIn(
              delay: const Duration(milliseconds: 100),
              child: const _WrappedKicker(text: 'MY DISCIPLINE SCORE'),
            ),
          ),

          // Hero block — anchored at top: 130. Grade word is the sub-caption,
          // verdict sits directly underneath.
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
                    child: Text(
                      '$score',
                      maxLines: 1,
                      softWrap: false,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 240,
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
                    'out of 100',
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
                FadeIn(
                  delay: const Duration(milliseconds: 500),
                  child: Text(
                    _grade(score),
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 1.6,
                      fontFamily: 'DepartureMono',
                    ),
                  ),
                ),
                const SizedBox(height: 10),
                FadeIn(
                  delay: const Duration(milliseconds: 650),
                  child: Text(
                    _verdict(score),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.7),
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 0.2,
                      height: 1.4,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Progress bar in lower band.
          Positioned(
            left: 32,
            right: 32,
            bottom: 130,
            child: FadeIn(
              delay: const Duration(milliseconds: 800),
              child: _ScoreBar(score: score),
            ),
          ),

          _WrappedWordmark(year: stats.year, username: stats.username),
        ],
      ),
    );
  }
}

/// Horizontal progress bar that fills from 0 → score/100 over 1500ms.
/// A small `{score}/100` mono label sits at the right end of the fill.
class _ScoreBar extends StatefulWidget {
  final int score;
  const _ScoreBar({required this.score});

  @override
  State<_ScoreBar> createState() => _ScoreBarState();
}

class _ScoreBarState extends State<_ScoreBar>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _anim;
  bool _started = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    );
    _anim = CurvedAnimation(parent: _controller, curve: Curves.easeOutCubic);
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
    final target = widget.score / 100.0;
    return LayoutBuilder(
      builder: (context, constraints) {
        final fullWidth = constraints.maxWidth;
        return AnimatedBuilder(
          animation: _anim,
          builder: (context, _) {
            final fill = (fullWidth * target * _anim.value).clamp(0.0, fullWidth);
            return SizedBox(
              height: 14,
              child: Stack(
                alignment: Alignment.centerLeft,
                children: [
                  // Track.
                  Container(
                    height: 14,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(7),
                    ),
                  ),
                  // Fill.
                  Container(
                    width: fill,
                    height: 14,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.92),
                      borderRadius: BorderRadius.circular(7),
                    ),
                  ),
                  // Mono label pinned just past the fill end. We position it
                  // along the bar in proportion to the animated fill so it
                  // rides the bar to its final spot.
                  Positioned(
                    left: (fill + 6).clamp(0.0, fullWidth - 60),
                    child: Opacity(
                      opacity: _anim.value.clamp(0.0, 1.0),
                      child: Text(
                        '${widget.score}/100',
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.85),
                          fontFamily: 'DepartureMono',
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 0.6,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
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
