import 'package:flutter/material.dart';
import '../models/wrapped_stats.dart';
import '../themes/archetype_themes.dart';
import '../themes/wrapped_palette.dart';
import '../widgets/twemoji_image.dart';
import 'slide_scaffold.dart';

/// Wrapped Pattern B — single massive stat. Shared commits with the top
/// collaborator. Top half: two overlapping initial-circles (you and the
/// collaborator). Lone-wolf fallback: a single big wolf emoji instead.
class CollaboratorSlide extends StatelessWidget {
  final WrappedStats stats;
  final ArchetypeTheme theme;
  const CollaboratorSlide({
    super.key,
    required this.stats,
    required this.theme,
  });

  String _initial(String username) {
    final trimmed = username.trim();
    if (trimmed.isEmpty) return '?';
    return trimmed.substring(0, 1).toUpperCase();
  }

  @override
  Widget build(BuildContext context) {
    final collab = stats.topCollaborators.isNotEmpty
        ? stats.topCollaborators.first
        : null;

    final int statValue;
    final String label;
    final String subCaption;
    if (collab == null) {
      statValue = 0;
      label = 'co-committers';
      subCaption = 'shipped solo this year';
    } else {
      statValue = collab.sharedCommits;
      label = 'shipped together';
      subCaption = 'with @${collab.username}';
    }

    return SlideScaffold(
      theme: theme,
      slideColor: WrappedPalette.collaborator,
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
              child: const _WrappedKicker(text: 'MY MAIN COLLAB'),
            ),
          ),

          // Upper band — overlapping circles or the lone-wolf emoji, vertically
          // centered in a 160px slot.
          Positioned(
            top: 110,
            left: 0,
            right: 0,
            height: 160,
            child: Center(
              child: collab == null
                  ? ScaleIn(
                      delay: const Duration(milliseconds: 200),
                      from: 0.6,
                      child: const TwemojiImage(emoji: '🐺', size: 130),
                    )
                  : ScaleIn(
                      delay: const Duration(milliseconds: 200),
                      from: 0.6,
                      child: _OverlappingCircles(
                        leftInitial: _initial(stats.username),
                        rightInitial: _initial(collab.username),
                      ),
                    ),
            ),
          ),

          // Hero block — anchored at top: 320 (pushed down for the circles).
          Positioned(
            top: 320,
            left: 32,
            right: 32,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ScaleIn(
                  delay: const Duration(milliseconds: 350),
                  from: 0.6,
                  child: FittedBox(
                    fit: BoxFit.scaleDown,
                    alignment: Alignment.centerLeft,
                    child: Text(
                      '$statValue',
                      maxLines: 1,
                      softWrap: false,
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
                  delay: const Duration(milliseconds: 500),
                  child: Text(
                    label,
                    style: const TextStyle(
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
                  delay: const Duration(milliseconds: 650),
                  child: Text(
                    subCaption,
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.7),
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 0.2,
                    ),
                  ),
                ),
              ],
            ),
          ),

          _WrappedWordmark(year: stats.year, username: stats.username),
        ],
      ),
    );
  }
}

/// Two solid white-bordered circles overlapping by ~30%. Each shows a
/// bold initial; no actual avatar fetch.
class _OverlappingCircles extends StatelessWidget {
  final String leftInitial;
  final String rightInitial;
  const _OverlappingCircles({
    required this.leftInitial,
    required this.rightInitial,
  });

  @override
  Widget build(BuildContext context) {
    const double size = 140;
    const double overlap = 0.30; // 30% overlap
    const double totalWidth = size * (2 - overlap);

    return SizedBox(
      width: totalWidth,
      height: size,
      child: Stack(
        children: [
          // Left circle.
          Positioned(
            left: 0,
            top: 0,
            child: _InitialCircle(
              initial: leftInitial,
              fill: Colors.white.withValues(alpha: 0.15),
              size: size,
            ),
          ),
          // Right circle, overlapping the left.
          Positioned(
            left: size * (1 - overlap),
            top: 0,
            child: _InitialCircle(
              initial: rightInitial,
              fill: Colors.white.withValues(alpha: 0.25),
              size: size,
            ),
          ),
        ],
      ),
    );
  }
}

class _InitialCircle extends StatelessWidget {
  final String initial;
  final Color fill;
  final double size;
  const _InitialCircle({
    required this.initial,
    required this.fill,
    required this.size,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: fill,
        shape: BoxShape.circle,
        border: Border.all(color: Colors.white, width: 3),
      ),
      alignment: Alignment.center,
      child: Text(
        initial,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 48,
          fontWeight: FontWeight.w900,
          height: 1.0,
          letterSpacing: -1.0,
        ),
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
