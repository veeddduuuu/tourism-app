import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Link, Redirect, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as WebBrowser from "expo-web-browser";
import { useSignIn } from "@clerk/expo/legacy";
import { useSSO } from "@clerk/expo/experimental";
import { useHostedAuth } from "@clerk/expo/hosted-auth";

import AuthChrome from "../../components/auth/AuthChrome";
import PressableScale from "../../components/common/PressableScale";
import { useAppAuth } from "../../providers/authContext";
import {
  isClerkConfigured,
  clerkErrorMessage,
  continueAfterAuth,
} from "../../lib/clerk";
import { runGoogleSso } from "../../lib/googleAuth";
import { registerAccount } from "../../services/endpoints/auth";
import { ApiError } from "../../services/http";

WebBrowser.maybeCompleteAuthSession();

const GOLD = "#E8B45C";

export default function RegisterScreen() {
  const auth = useAppAuth();
  const { next } = useLocalSearchParams<{ next?: string }>();

  if (!isClerkConfigured) {
    return (
      <AuthChrome
        title="Create account"
        subtitle="Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to enable Clerk."
      >
        <Text style={styles.hint}>
          Copy your publishable key from the Clerk dashboard, then restart Expo.
        </Text>
      </AuthChrome>
    );
  }

  if (!auth.enabled || !auth.isLoaded) {
    return (
      <AuthChrome title="Create account" subtitle="Loading your session…">
        <ActivityIndicator color={GOLD} />
      </AuthChrome>
    );
  }

  if (auth.isSignedIn) {
    return (
      <Redirect
        href={(next === "onboarding" ? "/guide-selector" : "/(tabs)") as any}
      />
    );
  }

  return <RegisterForm next={next} />;
}

function RegisterForm({ next }: { next?: string }) {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { startSSOFlow } = useSSO();
  const { startHostedAuth } = useHostedAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const goIn = () => continueAfterAuth(next);

  const onRegister = async () => {
    if (!isLoaded || !signIn || !setActive) return;
    const emailAddress = email.trim();
    setError(null);
    setBusy(true);
    try {
      try {
        await registerAccount(emailAddress, password);
      } catch (err) {
        if (!(err instanceof ApiError && err.status === 200)) {
          if (err instanceof ApiError && err.isNetworkError) {
            setError(
              "Cannot reach the Aaroh API. Start the backend and set EXPO_PUBLIC_API_URL to this machine (not localhost on a phone)."
            );
            return;
          }
          throw err;
        }
      }

      const signedIn = await signIn.create({
        identifier: emailAddress,
        password,
      });
      const sessionId = signedIn.createdSessionId ?? signIn.createdSessionId;
      if (!sessionId) {
        setError("Account is ready, but sign-in did not return a session. Try the Sign in screen.");
        return;
      }

      await setActive({ session: sessionId });
      goIn();
    } catch (err) {
      setError(clerkErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const onGoogle = async () => {
    setError(null);
    setBusy(true);
    try {
      const result = await runGoogleSso(startSSOFlow, startHostedAuth);
      if (result.ok) {
        goIn();
        return;
      }
      setError(result.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthChrome
      title="Create account"
      subtitle="Save trip plans against your Clerk user, then reopen them from Profile."
    >
      <TextInput
        style={styles.input}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        placeholder="Email"
        placeholderTextColor="rgba(246,241,231,0.4)"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        autoCapitalize="none"
        autoComplete="password-new"
        secureTextEntry
        placeholder="Password (8+ characters)"
        placeholderTextColor="rgba(246,241,231,0.4)"
        value={password}
        onChangeText={setPassword}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <PressableScale onPress={onRegister} disabled={busy}>
        <LinearGradient
          colors={["#F2C879", GOLD, "#C98F3C"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.primary}
        >
          {busy ? (
            <ActivityIndicator color="#3A2708" />
          ) : (
            <Text style={styles.primaryText}>Create account</Text>
          )}
        </LinearGradient>
      </PressableScale>

      <PressableScale onPress={onGoogle} disabled={busy} style={styles.ghostWrap}>
        <View style={styles.ghost}>
          <Text style={styles.ghostText}>Continue with Google</Text>
        </View>
      </PressableScale>

      <View nativeID="clerk-captcha" />

      <Text style={styles.footer}>
        Already have an account?{" "}
        <Link
          href={
            (next
              ? `/(auth)/login?next=${encodeURIComponent(next)}`
              : "/(auth)/login") as any
          }
          style={styles.link}
        >
          Sign in
        </Link>
      </Text>
    </AuthChrome>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(246,241,231,0.16)",
    borderRadius: 16,
    color: "#F6F1E7",
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
  },
  error: {
    color: "#FCA5A5",
    marginBottom: 12,
    fontSize: 14,
  },
  primary: {
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  primaryText: {
    color: "#3A2708",
    fontSize: 17,
    fontWeight: "800",
  },
  ghostWrap: { marginTop: 12 },
  ghost: {
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(246,241,231,0.2)",
  },
  ghostText: {
    color: "#F6F1E7",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    marginTop: 28,
    color: "rgba(246,241,231,0.7)",
    textAlign: "center",
    fontSize: 15,
  },
  link: { color: GOLD, fontWeight: "700" },
  hint: { color: "rgba(246,241,231,0.7)", fontSize: 15, lineHeight: 22 },
});
