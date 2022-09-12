Based off https://www.gnome-look.org/p/1844859/

Fixed transparency for all the icons with the following command

find . -name '*.svg' -H -exec sed -i.bak "s/fill-opacity='.01'/fill-opacity='0'/g" {} \;

Copy into ~/.icons

So should look like ~/.icons/Pop-Extended-dark-transparent

Apply it in Gnome Tweaks
