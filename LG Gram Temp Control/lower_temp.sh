# Run as root

# Tells Intel CPU to thermally throttle to 100-offset *C.
# Setting to max temp of 60
# Only tested on LG Gram 17 2022
# May need to use a different cooling_device id

TARGET=$1
OFFSET=$((100-$TARGET))
echo "Targetting" $TARGET "with offset" $OFFSET
echo $OFFSET > /sys/devices/virtual/thermal/cooling_device17/cur_state
