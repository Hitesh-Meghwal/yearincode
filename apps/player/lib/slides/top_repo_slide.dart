import 'package:flutter/material.dart';
import '../models/wrapped_stats.dart';
import '../themes/archetype_themes.dart';
import 'slide_scaffold.dart';

/// Top repo, framed as a macOS-style terminal card with the commit count
/// blown out underneath as a HUGE editorial number.
class TopRepoSlide extends StatelessWidget {
  final WrappedStats stats;
  final ArchetypeTheme theme;
  const TopRepoSlide({super.key, required this.stats, required this.theme});

  @override
  Widget build(BuildContext context) {
    final repo = stats.topRepos.isNotEmpty ? stats.topRepos.first : null;
    final repoName = repo?.name ?? 'no repos found';
    final commits = repo?.commits ?? 0;
    final isPrivate = repo?.isPrivate ?? false;

    return SlideScaffold(
      theme: theme,
      backgroundSeed: 71,
      padding: EdgeInsets.zero,
      child: LayoutBuilder(
        builder: (context, constraints) {
          final w = constraints.maxWidth;
          final h = constraints.maxHeight;
          final commitsFontSize = (w * 0.22).clamp(80.0, 110.0);

          return Stack(
            children: [
              // ------- eyebrow caption.
              Positioned(
                top: 60,
                left: 28,
                child: FadeIn(
                  slideFrom: const Offset(-0.1, 0),
                  child: _MonoCaption('// MAIN CHARACTER'),
                ),
              ),
              Positioned(
                top: 60,
                right: 28,
                child: FadeIn(
                  slideFrom: const Offset(0.1, 0),
                  child: _MonoCaption('${stats.totalRepos} REPOS · ${stats.year}'),
                ),
              ),

              // ------- TERMINAL CARD, top-aligned, slight off-centre.
              Positioned(
                top: h * 0.14,
                left: 28,
                right: 28,
                child: FadeIn(
                  delay: const Duration(milliseconds: 150),
                  slideFrom: const Offset(0, 0.06),
                  child: _TerminalCard(
                    repoName: repoName,
                    isPrivate: isPrivate,
                    accent: theme.primary,
                  ),
                ),
              ),

              // ------- sticker badge hanging off the card's BOTTOM-right
              // corner. Inside the safe area.
              Positioned(
                top: h * 0.40,
                right: 28,
                child: FadeIn(
                  delay: const Duration(milliseconds: 600),
                  slideFrom: const Offset(0.2, -0.1),
                  child: StickerBadge(
                    text: 'MAIN CHARACTER',
                    color: theme.secondary,
                    rotation: -0.04,
                  ),
                ),
              ),

              // ------- commit count, inside the safe area, FittedBox guards
              // long digit strings.
              Positioned(
                left: 28,
                right: 28,
                bottom: 150,
                child: FadeIn(
                  delay: const Duration(milliseconds: 450),
                  slideFrom: const Offset(-0.05, 0.05),
                  child: FittedBox(
                    fit: BoxFit.scaleDown,
                    alignment: Alignment.bottomLeft,
                    child: Text(
                      commits.toString(),
                      maxLines: 1,
                      softWrap: false,
                      overflow: TextOverflow.visible,
                      style: TextStyle(
                        color: theme.primary,
                        fontSize: commitsFontSize,
                        fontWeight: FontWeight.w900,
                        height: 1.0,
                        letterSpacing: -4,
                      ),
                    ),
                  ),
                ),
              ),

              // ------- caption under the hero number.
              Positioned(
                left: 28,
                right: 28,
                bottom: 100,
                child: FadeIn(
                  delay: const Duration(milliseconds: 700),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Container(
                        width: 20,
                        height: 2,
                        color: theme.primary,
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          'COMMITS TO ONE REPO',
                          style: TextStyle(
                            color: Colors.white.withValues(alpha: 0.75),
                            fontFamily: 'monospace',
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 2.4,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // ------- footer factoid.
              Positioned(
                left: 28,
                right: 28,
                bottom: 60,
                child: FadeIn(
                  delay: const Duration(milliseconds: 900),
                  child: Text(
                    'across ${stats.totalRepos} repos · ${stats.totalCommits} commits total',
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.5),
                      fontFamily: 'monospace',
                      fontSize: 10,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 1.2,
                    ),
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

class _MonoCaption extends StatelessWidget {
  final String text;
  const _MonoCaption(this.text);
  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      style: TextStyle(
        color: Colors.white.withValues(alpha: 0.55),
        fontFamily: 'monospace',
        fontSize: 10,
        fontWeight: FontWeight.w700,
        letterSpacing: 2,
      ),
    );
  }
}

/// macOS-style terminal window: title bar with traffic-light dots (or a
/// PRIVATE tag when the repo is private), then a body with a prompt line and
/// the repo name in big mono type.
class _TerminalCard extends StatelessWidget {
  final String repoName;
  final bool isPrivate;
  final Color accent;
  const _TerminalCard({
    required this.repoName,
    required this.isPrivate,
    required this.accent,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF0B0B0F),
        border: Border.all(
          color: Colors.white.withValues(alpha: 0.12),
          width: 1,
        ),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // -------- title bar
          Container(
            height: 32,
            decoration: BoxDecoration(
              color: const Color(0xFF15151B),
              border: Border(
                bottom: BorderSide(
                  color: Colors.white.withValues(alpha: 0.08),
                  width: 1,
                ),
              ),
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(9),
                topRight: Radius.circular(9),
              ),
            ),
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: Row(
              children: [
                if (isPrivate) ...[
                  // Replace one of the traffic-light dots with a PRIVATE tag.
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.08),
                      border: Border.all(
                        color: Colors.white.withValues(alpha: 0.2),
                        width: 1,
                      ),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: const Text(
                      'PRIVATE',
                      style: TextStyle(
                        color: Colors.white,
                        fontFamily: 'monospace',
                        fontSize: 9,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 1.4,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  const _Dot(color: Color(0xFFFFBD2E)),
                  const SizedBox(width: 6),
                  const _Dot(color: Color(0xFF28C940)),
                ] else ...[
                  const _Dot(color: Color(0xFFFF5F57)),
                  const SizedBox(width: 6),
                  const _Dot(color: Color(0xFFFFBD2E)),
                  const SizedBox(width: 6),
                  const _Dot(color: Color(0xFF28C940)),
                ],
                const Spacer(),
                Text(
                  '~/repos',
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.35),
                    fontFamily: 'monospace',
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                    letterSpacing: 0.5,
                  ),
                ),
              ],
            ),
          ),
          // -------- body
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 18, 16, 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      r'$',
                      style: TextStyle(
                        color: accent,
                        fontFamily: 'monospace',
                        fontSize: 14,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'top --repo',
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.75),
                        fontFamily: 'monospace',
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 0.3,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                // Repo name, big mono, possibly multi-line for long names.
                Text(
                  repoName,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    color: Colors.white,
                    fontFamily: 'monospace',
                    fontSize: 24,
                    fontWeight: FontWeight.w900,
                    height: 1.05,
                    letterSpacing: -0.8,
                  ),
                ),
                const SizedBox(height: 6),
                // Faux cursor row.
                Row(
                  children: [
                    Text(
                      r'$',
                      style: TextStyle(
                        color: accent,
                        fontFamily: 'monospace',
                        fontSize: 14,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      width: 10,
                      height: 18,
                      color: accent,
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _Dot extends StatelessWidget {
  final Color color;
  const _Dot({required this.color});
  @override
  Widget build(BuildContext context) {
    return Container(
      width: 11,
      height: 11,
      decoration: BoxDecoration(
        color: color,
        shape: BoxShape.circle,
      ),
    );
  }
}
