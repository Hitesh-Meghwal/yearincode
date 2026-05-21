import 'package:flutter/material.dart';

class ArchetypeTheme {
  final Color primary;
  final Color secondary;
  final Color background;
  const ArchetypeTheme({
    required this.primary,
    required this.secondary,
    required this.background,
  });
}

// Per PRD §6.2. Themes not listed in the PRD fall back to the default Builder
// theme (deep blue + amber).
const Map<String, ArchetypeTheme> archetypeThemes = {
  'night-owl-refactorer': ArchetypeTheme(
    primary: Color(0xFF7C3AED),
    secondary: Color(0xFFFBBF24),
    background: Color(0xFF0F0524),
  ),
  'weekend-warrior': ArchetypeTheme(
    primary: Color(0xFFEF4444),
    secondary: Color(0xFFFBBF24),
    background: Color(0xFF1A0A0A),
  ),
  'metronome': ArchetypeTheme(
    primary: Color(0xFF06B6D4),
    secondary: Color(0xFFFFFFFF),
    background: Color(0xFF000814),
  ),
  'refactorer': ArchetypeTheme(
    primary: Color(0xFFF97316),
    secondary: Color(0xFF000000),
    background: Color(0xFF1A0E05),
  ),
  'polyglot': ArchetypeTheme(
    primary: Color(0xFF10B981),
    secondary: Color(0xFFEC4899),
    background: Color(0xFF02180F),
  ),
};

const ArchetypeTheme _defaultTheme = ArchetypeTheme(
  primary: Color(0xFF3B82F6),
  secondary: Color(0xFFF59E0B),
  background: Color(0xFF0A0F1F),
);

ArchetypeTheme themeForArchetype(String archetypeId) {
  return archetypeThemes[archetypeId] ?? _defaultTheme;
}
