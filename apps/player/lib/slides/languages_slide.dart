import 'package:flutter/material.dart';
import '../models/wrapped_stats.dart';
import '../themes/archetype_themes.dart';
import '../themes/wrapped_palette.dart';
import '../widgets/devicon.dart';
import 'slide_scaffold.dart';

/// Wrapped Pattern A — numbered 1-5 list. Each row pairs the rank with the
/// language's real Devicon SVG, name, and a faint horizontal bar whose width
/// tracks the percentage. Falls back to a first-letter tile if we don't have
/// the icon.
class LanguagesSlide extends StatelessWidget {
  final WrappedStats stats;
  final ArchetypeTheme theme;
  const LanguagesSlide({super.key, required this.stats, required this.theme});

  @override
  Widget build(BuildContext context) {
    final langs = stats.topLanguages.take(5).toList();
    final maxPct = langs.isEmpty
        ? 1.0
        : langs
            .map((l) => l.percentage)
            .reduce((a, b) => a > b ? a : b);
    // Always render 5 rows. Real languages fill from the top; the rest are
    // ghosted placeholders so the "Top 5" chart rhythm is preserved when
    // someone has only one or two languages.
    final placeholderCount = (5 - langs.length).clamp(0, 5);

    return SlideScaffold(
      theme: theme,
      slideColor: WrappedPalette.languages,
      padding: EdgeInsets.zero,
      child: Stack(
        children: [
          Positioned(
            top: 56,
            left: 32,
            right: 32,
            child: FadeIn(
              delay: const Duration(milliseconds: 100),
              child: const _WrappedKicker(text: 'MY TECH STACK'),
            ),
          ),

          Positioned.fill(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(28, 110, 28, 80),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  for (var i = 0; i < langs.length; i += 1)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      child: FadeIn(
                        delay: Duration(milliseconds: 180 + i * 120),
                        slideFrom: const Offset(-0.05, 0),
                        child: _LangRow(
                          rank: i + 1,
                          lang: langs[i],
                          barFraction: langs[i].percentage / maxPct,
                        ),
                      ),
                    ),
                  for (var i = 0; i < placeholderCount; i += 1)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      child: FadeIn(
                        delay: Duration(
                            milliseconds: 180 + (langs.length + i) * 120),
                        slideFrom: const Offset(-0.05, 0),
                        child: _PlaceholderRow(rank: langs.length + i + 1),
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

class _PlaceholderRow extends StatelessWidget {
  final int rank;
  const _PlaceholderRow({required this.rank});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 76,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            SizedBox(
              width: 40,
              child: Text(
                '$rank',
                style: TextStyle(
                  color: Colors.white.withValues(alpha: 0.18),
                  fontSize: 40,
                  fontWeight: FontWeight.w400,
                  height: 1.0,
                  letterSpacing: -1.5,
                  fontFamily: 'Boldonse',
                ),
              ),
            ),
            const SizedBox(width: 8),
            // Empty plate matching the real-row Devicon container, so the
            // grid column lines up regardless of how many real rows there are.
            Container(
              width: 60,
              height: 60,
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.05),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: Colors.white.withValues(alpha: 0.10),
                  width: 1,
                ),
              ),
              alignment: Alignment.center,
              child: Text(
                '—',
                style: TextStyle(
                  color: Colors.white.withValues(alpha: 0.25),
                  fontSize: 22,
                  fontWeight: FontWeight.w700,
                  height: 1.0,
                ),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Text(
                'open slot',
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  color: Colors.white.withValues(alpha: 0.22),
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.2,
                  fontStyle: FontStyle.italic,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _LangRow extends StatelessWidget {
  final int rank;
  final LanguageStat lang;
  final double barFraction;
  const _LangRow({
    required this.rank,
    required this.lang,
    required this.barFraction,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 76,
      child: Stack(
        children: [
          // Faint percentage bar fill — sits behind the row content. Width
          // tracks this language's share relative to the top language.
          Positioned.fill(
            child: Align(
              alignment: Alignment.centerLeft,
              child: FractionallySizedBox(
                widthFactor: barFraction.clamp(0.05, 1.0),
                heightFactor: 1.0,
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.06),
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),
            ),
          ),

          // Row content.
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                // Rank — Boldonse so it reads like a chart position.
                SizedBox(
                  width: 40,
                  child: Text(
                    '$rank',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 40,
                      fontWeight: FontWeight.w400,
                      height: 1.0,
                      letterSpacing: -1.5,
                      fontFamily: 'Boldonse',
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                // Devicon SVG on a soft white plate so dark-tinted logos
                // (TypeScript blue, Rust orange) don't disappear into the
                // deep-blue slide background.
                Container(
                  width: 60,
                  height: 60,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.96),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  padding: const EdgeInsets.all(8),
                  child: DeviconImage(language: lang.name, size: 44),
                ),
                const SizedBox(width: 16),
                // Name + percentage.
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        lang.name,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 24,
                          fontWeight: FontWeight.w800,
                          height: 1.1,
                          letterSpacing: -0.4,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '${lang.commits} commits',
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.6),
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 0.4,
                          fontFamily: 'DepartureMono',
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                // Big right-aligned percentage. Mono so the digits stack
                // cleanly across rows.
                Text(
                  '${lang.percentage.toStringAsFixed(0)}%',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
                    letterSpacing: -0.5,
                    fontFamily: 'DepartureMono',
                  ),
                ),
              ],
            ),
          ),
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
