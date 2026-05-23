import 'package:flutter/material.dart';

/// Spotify-Wrapped-style solid background colors. One distinct dominant
/// color per slide; the wrapped rotates through saturated blocks rather
/// than sharing a single archetype-driven gradient across every card.
///
/// All colors are picked so the existing white-on-color text in the
/// slides stays readable. The outro is the one exception (bright yellow)
/// because its visible text sits inside the off-white ticket card; the
/// yellow only shows around the ticket's edge.
class WrappedPalette {
  WrappedPalette._();

  static const Color intro        = Color(0xFFEC4899); // hot pink
  static const Color commits      = Color(0xFF7C3AED); // violet
  static const Color lines        = Color(0xFF1E293B); // dark slate (lets the +/- blocks shine)
  static const Color languages    = Color(0xFF1E40AF); // deep blue
  static const Color peakHour     = Color(0xFF0A0A0A); // near-black
  static const Color topRepo      = Color(0xFFF97316); // orange
  static const Color streak       = Color(0xFF06B6D4); // cyan
  static const Color discipline   = Color(0xFFDC2626); // red
  static const Color collaborator = Color(0xFF8B5CF6); // purple
  static const Color archetype    = Color(0xFF0A0A0A); // near-black (lets the polaroid pop)
  static const Color outro        = Color(0xFFFCD34D); // bright yellow
}
