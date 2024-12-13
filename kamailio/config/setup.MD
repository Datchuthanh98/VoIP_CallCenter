
#
# Kamailio SIP Server v5.6 - default configuration script
#     - web: https://www.kamailio.org
#     - git: https://github.com/kamailio/kamailio
#
# Direct your questions about this file to: <sr-users@lists.kamailio.org>
#
# Refer to the Core CookBook at https://www.kamailio.org/wiki/
# for an explanation of possible statements, functions and parameters.
#
# Note: the comments can be:
#     - lines starting with #, but not the pre-processor directives,
#       which start with #!, like #!define, #!ifdef, #!endif, #!else, #!trydef,
#       #!subst, #!substdef, ...
#     - lines starting with //
#     - blocks enclosed in between /* */
# Note: the config performs symmetric SIP signaling
#     - it sends the reply to the source address of the request
#     - remove the use of force_rport() for asymmetric SIP signaling
#
# Several features can be enabled using '#!define WITH_FEATURE' directives:
#
# *** To run in debug mode:
#     - define WITH_DEBUG
#     - debug level increased to 3, logs still sent to syslog
#     - debugger module loaded with cfgtrace enabled
#
# *** To enable mysql:
#     - define WITH_MYSQL
#
# *** To enable authentication execute:
#     - enable mysql
#     - define WITH_AUTH
#     - add users using 'kamctl' or 'kamcli'
#
# *** To enable IP authentication execute:
#     - enable mysql
#     - enable authentication
#     - define WITH_IPAUTH
#     - add IP addresses with group id '1' to 'address' table
#
# *** To enable persistent user location execute:
#     - enable mysql
#     - define WITH_USRLOCDB
#
# *** To enable presence server execute:
#     - enable mysql
#     - define WITH_PRESENCE
#     - if modified headers or body in config must be used by presence handling:
#     - define WITH_MSGREBUILD
#
# *** To enable nat traversal execute:
#     - define WITH_NAT
#     - option for NAT SIP OPTIONS keepalives: WITH_NATSIPPING
#     - install RTPProxy: http://www.rtpproxy.org
#     - start RTPProxy:
#        rtpproxy -l _your_public_ip_ -s udp:localhost:7722
#
# *** To use RTPEngine (instead of RTPProxy) for nat traversal execute:
#     - define WITH_RTPENGINE
#     - install RTPEngine: https://github.com/sipwise/rtpengine
#     - start RTPEngine:
#        rtpengine --listen-ng=127.0.0.1:2223 ...
#
# *** To enable PSTN gateway routing execute:
#     - define WITH_PSTN
#     - set the value of pstn.gw_ip
#     - check route[PSTN] for regexp routing condition
#
# *** To enable database aliases lookup execute:
#     - enable mysql
#     - define WITH_ALIASDB
#
# *** To enable speed dial lookup execute:
#     - enable mysql
#     - define WITH_SPEEDDIAL
#
# *** To enable multi-domain support execute:
#     - enable mysql
#     - define WITH_MULTIDOMAIN
#
# *** To enable TLS support execute:
#     - adjust CFGDIR/tls.cfg as needed
#     - define WITH_TLS
#
# *** To enable JSONRPC over HTTP(S) support execute:
#     - define WITH_JSONRPC
#     - adjust event_route[xhttp:request] for access policy
#
# *** To enable anti-flood detection execute:
#     - adjust pike and htable=>ipban settings as needed (default is
#       block if more than 16 requests in 2 seconds and ban for 300 seconds)
#     - define WITH_ANTIFLOOD
#
# *** To block 3XX redirect replies execute:
#     - define WITH_BLOCK3XX
#
# *** To block 401 and 407 authentication replies execute:
#     - define WITH_BLOCK401407
#
# *** To enable VoiceMail routing execute:
#     - define WITH_VOICEMAIL
#     - set the value of voicemail.srv_ip
#     - adjust the value of voicemail.srv_port
#
# *** To enhance accounting execute:
#     - enable mysql
#     - define WITH_ACCDB
#     - add following columns to database

#!ifdef ACCDB_COMMENT
  ALTER TABLE acc ADD COLUMN src_user VARCHAR(64) NOT NULL DEFAULT '';
  ALTER TABLE acc ADD COLUMN src_domain VARCHAR(128) NOT NULL DEFAULT '';
  ALTER TABLE acc ADD COLUMN src_ip varchar(64) NOT NULL default '';
  ALTER TABLE acc ADD COLUMN dst_ouser VARCHAR(64) NOT NULL DEFAULT '';
  ALTER TABLE acc ADD COLUMN dst_user VARCHAR(64) NOT NULL DEFAULT '';
  ALTER TABLE acc ADD COLUMN dst_domain VARCHAR(128) NOT NULL DEFAULT '';
  ALTER TABLE missed_calls ADD COLUMN src_user VARCHAR(64) NOT NULL DEFAULT '';
  ALTER TABLE missed_calls ADD COLUMN src_domain VARCHAR(128) NOT NULL DEFAULT '';
  ALTER TABLE missed_calls ADD COLUMN src_ip varchar(64) NOT NULL default '';
  ALTER TABLE missed_calls ADD COLUMN dst_ouser VARCHAR(64) NOT NULL DEFAULT '';
  ALTER TABLE missed_calls ADD COLUMN dst_user VARCHAR(64) NOT NULL DEFAULT '';
  ALTER TABLE missed_calls ADD COLUMN dst_domain VARCHAR(128) NOT NULL DEFAULT '';
#!endif