import 'package:flutter/material.dart';
import '../models/wrapped_stats.dart';
import '../themes/archetype_themes.dart';
import '../widgets/count_up_text.dart';
import 'slide_scaffold.dart';

/// The big number. The commit count IS the slide — gradient-masked, 200px,
/// pushed off-center to the left. Mono caption hugs the baseline. Sticker
/// badges sit in opposing corners at opposing rotations for collage tension.
class CommitsSlide extends StatelessWidget {
  final WrappedStats stats;
  final ArchetypeTheme theme;
  const CommitsSlide({super.key, required this.stats, required this.theme});

  @override
  Widget build(BuildContext context) {
    final dateLabel =
        '${_shortDate(stats.dateRange.from)} -> ${_shortDate(stats.dateRange.to)}';

    return SlideScaffold(
      theme: theme,
      backgroundSeed: 31,
      padding: EdgeInsets.zero,
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          // KICKER — small mono label, top-left.
          Positioned(
            top: 60,
            left: 32,
            right: 32,
            child: FadeIn(
              delay: const Duration(milliseconds: 100),
              slideFrom: const Offset(-0.15, 0),
              child: Row(
                children: [
                  Container(
                    width: 28,
                    height: 2,
                    color: theme.primary,
                  ),
                  const SizedBox(width: 10),
                  Text(
                    'CHAPTER 01 / VOLUME',
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.7),
                      fontFamily: 'monospace',
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 2.4,
                    ),
                  ),
                ],
              ),
            ),
          ),

          // THE NUMBER — large, gradient masked, anchored low-left so it
          // visually leans against the bottom edge. Wrapped in FittedBox so a
          // 5+ digit commit count gracefully shrinks rather than clips off the
          // right edge.
          Positioned(
            left: 28,
            right: 28,
            top: 220,
            child: ShaderMask(
              shaderCallback: (rect) => LinearGradient(
                colors: [theme.primary, theme.secondary],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ).createShader(rect),
              blendMode: BlendMode.srcIn,
              child: ScaleIn(
                delay: const Duration(milliseconds: 250),
                duration: const Duration(milliseconds: 1100),
                from: 0.55,
                child: FittedBox(
                  fit: BoxFit.scaleDown,
                  alignment: Alignment.centerLeft,
                  child: CountUpText(
                    value: stats.totalCommits,
                    duration: const Duration(milliseconds: 1800),
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

          // CAPTION block — mono, hugs the number from below-left.
          Positioned(
            left: 32,
            bottom: 130,
            right: 32,
            child: FadeIn(
              delay: const Duration(milliseconds: 900),
              slideFrom: const Offset(-0.05, 0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 50,
                    height: 3,
                    color: Colors.white,
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'COMMITS',
                    style: TextStyle(
                      color: Colors.white,
                      fontFamily: 'monospace',
                      fontSize: 12,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 3.5,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    dateLabel,
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.55),
                      fontFamily: 'monospace',
                      fontSize: 10,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 1.5,
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Sticker TOP-RIGHT — active days.
          Positioned(
            top: 130,
            right: 28,
            child: FadeIn(
              delay: const Duration(milliseconds: 1100),
              slideFrom: const Offset(0.2, -0.05),
              child: StickerBadge(
                text: '${stats.totalActiveDays} ACTIVE DAYS',
                color: theme.secondary,
                rotation: 0.05,
              ),
            ),
          ),

          // Sticker BOTTOM-RIGHT — repo count, opposite rotation, opposite color.
          Positioned(
            right: 28,
            bottom: 64,
            child: FadeIn(
              delay: const Duration(milliseconds: 1250),
              slideFrom: const Offset(0.2, 0.05),
              child: StickerBadge(
                text: '${stats.totalRepos} REPOS',
                color: theme.primary,
                rotation: -0.05,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

String _shortDate(String iso) {
  // Inputs are ISO date strings like 2025-05-21. Return YYYY-MM-DD untouched
  // if it parses; otherwise fall back to the raw string.
  if (iso.length >= 10) return iso.substring(0, 10);
  return iso;
}
