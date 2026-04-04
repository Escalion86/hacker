Put compiled ESP32 binaries here:
- bootloader.bin
- partitions.bin
- boot_app0.bin
- firmware.bin

How to get them from Arduino IDE:
1) Select your ESP32 board and the partition scheme you use for release.
2) Sketch -> Export Compiled Binary.
3) Find generated files in sketch build output folder.
4) Copy and rename:
   * *.bootloader.bin -> bootloader.bin
   * *.partitions.bin -> partitions.bin
   * boot_app0.bin (from ESP32 core tools folder) -> boot_app0.bin
   * *.ino.bin (or *.bin) -> firmware.bin

boot_app0.bin location (typical Windows path):
%LOCALAPPDATA%\Arduino15\packages\esp32\hardware\esp32\<version>\tools\partitions\boot_app0.bin

Then open /flash/ in browser and install.
