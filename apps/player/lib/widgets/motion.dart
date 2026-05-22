import 'package:flutter/material.dart';

/// Returns true when the OS/browser is asking for reduced motion. We use this
/// across the player to skip purely decorative animations and jump straight
/// to the final state. PRD §5.5.
bool reduceMotionOf(BuildContext context) {
  return MediaQuery.of(context).disableAnimations;
}
