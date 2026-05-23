import 'package:flutter/material.dart';
import '../models/wrapped_stats.dart';
import '../themes/archetype_themes.dart';
import '../themes/wrapped_palette.dart';
import 'slide_scaffold.dart';

/// Wrapped Pattern C — headline / reveal. Kicker on top, avatar circle,
/// big two-line headline addressed to the user. RECAP-style wordmark
/// in the bottom-right corner.
class IntroSlide extends StatelessWidget {
  final WrappedStats stats;
  final ArchetypeTheme theme;
  const IntroSlide({super.key, required this.stats, required this.theme});

  @override
  Widget build(BuildContext context) {
    return SlideScaffold(
      theme: theme,
      slideColor: WrappedPalette.intro,
      padding: EdgeInsets.zero,
      child: Stack(
        children: [
          // KICKER — top-left.
          Positioned(
            top: 56,
            left: 32,
            right: 32,
            child: FadeIn(
              delay: const Duration(milliseconds: 100),
              child: _WrappedKicker(text: 'YEARINCODE  ·  ${stats.year}'),
            ),
          ),

          // BODY — avatar above, then headline. Centered vertically.
          Positioned.fill(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(32, 110, 32, 110),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Avatar.
                  ScaleIn(
                    delay: const Duration(milliseconds: 200),
                    from: 0.55,
                    child: _AvatarCircle(url: stats.avatarUrl, size: 120),
                  ),
                  const SizedBox(height: 32),
                  // Headline — two-line, addressed to the user.
                  FadeIn(
                    delay: const Duration(milliseconds: 350),
                    slideFrom: const Offset(-0.04, 0.04),
                    child: FittedBox(
                      fit: BoxFit.scaleDown,
                      alignment: Alignment.centerLeft,
                      child: Text(
                        'Hey @${stats.username}.',
                        maxLines: 1,
                        softWrap: false,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 56,
                          fontWeight: FontWeight.w900,
                          height: 1.0,
                          letterSpacing: -1.8,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  FadeIn(
                    delay: const Duration(milliseconds: 500),
                    slideFrom: const Offset(-0.04, 0.04),
                    child: const Text(
                      "Here's how\nyou shipped.",
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 56,
                        fontWeight: FontWeight.w900,
                        height: 1.02,
                        letterSpacing: -1.8,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // RECAP wordmark — bottom-right.
          _WrappedWordmark(year: stats.year, username: stats.username),
        ],
      ),
    );
  }
}

class _AvatarCircle extends StatelessWidget {
  final String url;
  final double size;
  const _AvatarCircle({required this.url, required this.size});

  @override
  Widget build(BuildContext context) {
    final ring = Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: Colors.white.withValues(alpha: 0.12),
        border: Border.all(color: Colors.white, width: 3),
      ),
      alignment: Alignment.center,
      child: const Icon(Icons.person, size: 56, color: Colors.white),
    );
    if (url.isEmpty) return ring;
    return ClipOval(
      child: SizedBox(
        width: size,
        height: size,
        child: Image.network(
          url,
          fit: BoxFit.cover,
          errorBuilder: (_, __, ___) => ring,
          loadingBuilder: (ctx, child, progress) =>
              progress == null ? child : ring,
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
          fontFamily: 'monospace',
          fontSize: 11,
          fontWeight: FontWeight.w700,
          letterSpacing: 2.2,
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
          fontFamily: 'monospace',
          fontSize: 11,
          fontWeight: FontWeight.w600,
          letterSpacing: 1.2,
        ),
      ),
    );
  }
}
