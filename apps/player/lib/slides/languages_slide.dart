import 'package:flutter/material.dart';
import '../models/wrapped_stats.dart';
import '../themes/archetype_themes.dart';
import '../themes/wrapped_palette.dart';
import 'slide_scaffold.dart';

/// Wrapped Pattern A — numbered 1-5 list. Each row: rank, language-color
/// square, language name, sub-line with commit count and percentage.
class LanguagesSlide extends StatelessWidget {
  final WrappedStats stats;
  final ArchetypeTheme theme;
  const LanguagesSlide({super.key, required this.stats, required this.theme});

  @override
  Widget build(BuildContext context) {
    final langs = stats.topLanguages.take(5).toList();

    return SlideScaffold(
      theme: theme,
      slideColor: WrappedPalette.languages,
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
              child: const _WrappedKicker(text: 'MY TECH STACK'),
            ),
          ),

          // 1–5 list.
          Positioned.fill(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(32, 110, 32, 80),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  if (langs.isEmpty)
                    const Text(
                      'no languages tracked',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 22,
                        fontWeight: FontWeight.w800,
                      ),
                    )
                  else
                    for (var i = 0; i < langs.length; i += 1)
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 6),
                        child: FadeIn(
                          delay: Duration(milliseconds: 180 + i * 120),
                          slideFrom: const Offset(-0.05, 0),
                          child: _LangRow(rank: i + 1, lang: langs[i]),
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

class _LangRow extends StatelessWidget {
  final int rank;
  final LanguageStat lang;
  const _LangRow({required this.rank, required this.lang});

  @override
  Widget build(BuildContext context) {
    final color = _colorFor(lang.name);
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        // Rank number.
        SizedBox(
          width: 44,
          child: Text(
            '$rank',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 36,
              fontWeight: FontWeight.w900,
              height: 1.0,
              letterSpacing: -1.2,
            ),
          ),
        ),
        const SizedBox(width: 4),
        // Colored square — stands in for an album cover.
        Container(
          width: 56,
          height: 56,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(4),
          ),
        ),
        const SizedBox(width: 16),
        // Name + sub-line.
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
                  fontSize: 22,
                  fontWeight: FontWeight.w800,
                  height: 1.1,
                  letterSpacing: -0.4,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                '${lang.commits} commits  ·  ${lang.percentage.toStringAsFixed(0)}%',
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  color: Colors.white.withValues(alpha: 0.65),
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 0.2,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

const Map<String, Color> _languageColors = {
  'JavaScript':  Color(0xFFF1E05A),
  'TypeScript':  Color(0xFF3178C6),
  'Python':      Color(0xFF3572A5),
  'Java':        Color(0xFFB07219),
  'Dart':        Color(0xFF00B4AB),
  'Go':          Color(0xFF00ADD8),
  'Rust':        Color(0xFFDEA584),
  'C':           Color(0xFF555555),
  'C++':         Color(0xFFF34B7D),
  'C#':          Color(0xFF178600),
  'Ruby':        Color(0xFF701516),
  'PHP':         Color(0xFF4F5D95),
  'Swift':       Color(0xFFFFAC45),
  'Kotlin':      Color(0xFFA97BFF),
  'HTML':        Color(0xFFE34C26),
  'CSS':         Color(0xFF563D7C),
  'Shell':       Color(0xFF89E051),
  'Vue':         Color(0xFF41B883),
  'SCSS':        Color(0xFFC6538C),
  'Lua':         Color(0xFF000080),
};

Color _colorFor(String name) {
  // Case-insensitive lookup so "javascript" / "JAVASCRIPT" still match.
  final lower = name.toLowerCase();
  for (final entry in _languageColors.entries) {
    if (entry.key.toLowerCase() == lower) return entry.value;
  }
  return const Color(0xFF94A3B8); // neutral grey fallback
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
