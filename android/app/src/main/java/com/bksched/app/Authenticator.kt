package com.bksched.app

import android.accounts.AbstractAccountAuthenticator
import android.accounts.Account
import android.accounts.AccountAuthenticatorResponse
import android.content.Context
import android.os.Bundle

class Authenticator(context: Context) : AbstractAccountAuthenticator(context) {
    override fun editProperties(r: AccountAuthenticatorResponse?, s: String?): Bundle? = null
    override fun addAccount(r: AccountAuthenticatorResponse?, s: String?, s2: String?, strings: Array<out String>?, b: Bundle?): Bundle? = null
    override fun confirmCredentials(r: AccountAuthenticatorResponse?, a: Account?, b: Bundle?): Bundle? = null
    override fun getAuthToken(r: AccountAuthenticatorResponse?, a: Account?, s: String?, b: Bundle?): Bundle? = null
    override fun getAuthTokenLabel(s: String?): String? = null
    override fun updateCredentials(r: AccountAuthenticatorResponse?, a: Account?, s: String?, b: Bundle?): Bundle? = null
    override fun hasFeatures(r: AccountAuthenticatorResponse?, a: Account?, strings: Array<out String>?): Bundle? = null
}