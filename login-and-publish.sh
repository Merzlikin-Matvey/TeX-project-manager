#!/bin/bash

echo $VSCE_TOKEN | vsce login $PUBLISHER_NAME --token
vsce publish