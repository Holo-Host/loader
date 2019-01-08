# Holo.host Loader Tools

hQuery is a js module handling network connections with HoloPorts. For the closed Alpha release it is only responsible for establishing connection from browser to HoloPort and handling errors gracefully.

Test sites:

- http://test1.imagexchange.pl - will return regular app
- http://test2.imagexchange.pl - will return working hApp (proto, if no results are returned then probably hcdev server died)
- http://test3.imagexchange.pl - will return error (no entries in tranche)
- http://test4.imagexchange.pl - will return error (no entries in url2dna)


