import 'package:flutter/material.dart';
import '../models/wrapped_stats.dart';
import '../themes/archetype_themes.dart';
import 'slide_scaffold.dart';

/// "Two-up." Two big overlapping solid-fill avatar circles. Above: mono caption.
/// Below: the two handles stacked like a record-label split, with the shared
/// commit count between them as massive editorial type. No orbits, no glows.
class CollaboratorSlide extends StatelessWidget {
  final WrappedStats stats;
  final ArchetypeTheme theme;
  const CollaboratorSlide({
    super.key,
    required this.stats,
    required this.theme,
  });

  @override
  Widget build(BuildContext context) {
    final collab = stats.topCollaborators.isNotEmpty
        ? stats.topCollaborators.first
        : null;

    return SlideScaffold(
      theme: theme,
      backgroundSeed: 127,
      padding: EdgeInsets.zero,
      child: collab == null
          ? _LoneWolf(theme: theme)
          : _TwoUp(stats: stats, theme: theme, collab: collab),
    );
  }
}

class _TwoUp extends StatelessWidget {
  final WrappedStats stats;
  final ArchetypeTheme theme;
  final CollaboratorStat collab;
  const _TwoUp({
    required this.stats,
    required this.theme,
    required this.collab,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 60),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Mono caption — top-aligned, terminal-style prompt.
          FadeIn(
            slideFrom: const Offset(-0.1, 0),
            child: Text(
              '> SHIPPED TOGETHER',
              style: TextStyle(
                color: theme.secondary,
                fontSize: 12,
                fontFamily: 'monospace',
                fontWeight: FontWeight.w800,
                letterSpacing: 2.2,
              ),
            ),
          ),
          const SizedBox(height: 28),

          // Two overlapping solid circles. Slight off-center placement.
          Align(
            alignment: Alignment.centerLeft,
            child: ScaleIn(
              from: 0.5,
              delay: const Duration(milliseconds: 200),
              child: SizedBox(
                width: 196,
                height: 112,
                child: Stack(
                  children: [
                    Positioned(
                      left: 0,
                      top: 0,
                      child: _SolidAvatar(
                        label: stats.username,
                        color: theme.primary,
                      ),
                    ),
                    Positioned(
                      left: 70, // overlap by ~30%
                      top: 10,
                      child: _SolidAvatar(
                        label: collab.username,
                        color: theme.secondary,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          const SizedBox(height: 24),

          // Record-label split: handle / huge number / handle.
          FadeIn(
            delay: const Duration(milliseconds: 500),
            child: Text(
              '@${stats.username}',
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 24,
                fontWeight: FontWeight.w900,
                letterSpacing: -0.5,
                height: 1.05,
              ),
            ),
          ),
          const SizedBox(height: 4),

          // Shared commits — large type. Capped at 110 and FittedBox-guarded so
          // a 4+ digit count cannot reach the right edge.
          FadeIn(
            delay: const Duration(milliseconds: 700),
            slideFrom: const Offset(-0.08, 0),
            child: ShaderMask(
              shaderCallback: (rect) => LinearGradient(
                colors: [theme.primary, theme.secondary],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ).createShader(rect),
              child: FittedBox(
                fit: BoxFit.scaleDown,
                alignment: Alignment.centerLeft,
                child: Text(
                  '${collab.sharedCommits}',
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
          const SizedBox(height: 2),
          FadeIn(
            delay: const Duration(milliseconds: 850),
            child: Text(
              'SHARED COMMITS',
              style: TextStyle(
                color: Colors.white.withValues(alpha: 0.55),
                fontSize: 10,
                fontFamily: 'monospace',
                fontWeight: FontWeight.w700,
                letterSpacing: 2,
              ),
            ),
          ),
          const SizedBox(height: 14),
          FadeIn(
            delay: const Duration(milliseconds: 1000),
            child: Text(
              '@${collab.username}',
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                color: theme.secondary,
                fontSize: 24,
                fontWeight: FontWeight.w900,
                letterSpacing: -0.5,
                height: 1.05,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _LoneWolf extends StatelessWidget {
  final ArchetypeTheme theme;
  const _LoneWolf({required this.theme});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 60),
      child: Stack(
        children: [
          // Large emoji, inside the safe area on the bottom-right.
          Positioned(
            right: 0,
            bottom: 80,
            child: ScaleIn(
              from: 0.55,
              delay: const Duration(milliseconds: 200),
              child: const Text(
                '🐺',
                style: TextStyle(fontSize: 180, height: 1),
              ),
            ),
          ),
          // Mono caption block, top-left.
          Positioned(
            left: 0,
            top: 0,
            child: FadeIn(
              slideFrom: const Offset(-0.1, 0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '> LONE WOLF',
                    style: TextStyle(
                      color: theme.secondary,
                      fontSize: 12,
                      fontFamily: 'monospace',
                      fontWeight: FontWeight.w800,
                      letterSpacing: 2.2,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    'SHIPPED\nSOLO\nTHIS\nYEAR.',
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.96),
                      fontSize: 50,
                      fontWeight: FontWeight.w900,
                      height: 1.0,
                      letterSpacing: -1.6,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _SolidAvatar extends StatelessWidget {
  final String label;
  final Color color;
  const _SolidAvatar({required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    final initial = label.isNotEmpty ? label[0].toUpperCase() : '?';
    return Container(
      width: 94,
      height: 94,
      decoration: BoxDecoration(
        color: color,
        shape: BoxShape.circle,
        border: Border.all(color: Colors.black, width: 3),
      ),
      alignment: Alignment.center,
      child: Text(
        initial,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 46,
          fontWeight: FontWeight.w900,
          height: 1,
          letterSpacing: -1.6,
        ),
      ),
    );
  }
}
